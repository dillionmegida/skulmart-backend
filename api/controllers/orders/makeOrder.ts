import chalk from "chalk";
import mongoose from "mongoose";
import BuyerInterface from "interfaces/Buyer";
import SellerInterface from "interfaces/Seller";
import StoreInterface from "interfaces/Store";
import OrderInterface, {
  GroupedOrdersPurchasedFromSeller,
} from "interfaces/OrderInterface";
import Seller from "models/Seller";
import Order from "models/Order";
import shortId from "shortid";
import axios from "axios";
import addPaystackAuth from "utils/addPaystackAuth";
import { PAYSTACK_HOSTNAME } from "constants/index";
import Cart from "models/Cart";
import orderMadeEmailForSeller from "mails/orderMadeEmailForSeller";
import orderMadeEmailForBuyer from "mails/orderMadeEmailForBuyer";
import Buyer from "models/Buyer";
import { shortenUrlAndSave } from "utils/urls";
import { getConfirmOrderReceivedLinkForBuyer } from "utils/order";
import Product from "models/Product";
import smsAfterBuyerMakesOrder from "sms/smsAfterBuyerMakesOrder";
import { convertToKobo } from "utils/money";
import { storePopulate } from "utils/documentPopulate";

const IS_DEV = process.env.NODE_ENV === "dev";

export default async function makeOrder(req: any, res: any) {
  const buyer = req.user as BuyerInterface;

  const { orders: allOrders, message, card_signature } = req.body as {
    message: string;
    orders: [OrderInterface & { quantity_available: number }];
    card_signature: string;
  };

  let totalAmount = 0;
  const unsoldOrders: OrderInterface[] = [];

  allOrders.forEach((o) => {
    if (typeof o.quantity_available !== "number") {
      // Ensure that quantity_available is provided
      // as this is the way to ensure that the products to be bought
      // have not been bought
      throw new Error("`quantity_available` must be sent from client");
    }

    if (o.quantity_available < 1) return; // the item in this order has been sold

    if (o.quantity > o.quantity_available) {
      // qty in cart is higher than available
      // also, the client has to show that the qtys buyers pay for
      // is lower than what they added to cart, due to some items sold
      o.quantity = o.quantity_available;
    }
    unsoldOrders.push(o);
    totalAmount += o.price_when_bought * o.quantity;
    if (o.delivery_fee_when_bought > 0)
      totalAmount += o.delivery_fee_when_bought;
  });

  const totalAmountInKobo = convertToKobo(totalAmount);

  const cardToPayWith = buyer.cards.find(
    ({ signature }) => signature === card_signature
  );

  if (!cardToPayWith)
    return res.status(400).json({ message: "Card to pay with does not exist" });

  const groupOrdersPurchasedFromSeller: GroupedOrdersPurchasedFromSeller = {};

  try {
    for (let i = 0; i < unsoldOrders.length; i++) {
      const order = unsoldOrders[i];
      const sellerUsername = IS_DEV
        ? "deeesigns-studios" // in development, I want to use this user for testing
        : order.seller_username;

      const sellerOrders =
        groupOrdersPurchasedFromSeller[sellerUsername] || null;

      if (sellerOrders) {
        // seller already has item in the group
        sellerOrders.orders.push(order);
      } else {
        const seller = (await Seller.findOne({
          username: sellerUsername,
        }).populate({ ...storePopulate })) as SellerInterface & {
          store: StoreInterface;
        };

        if (!seller)
          return res.status(400).json({
            message:
              "Error occured. Please try again or contact support if you have been debited",
          });

        const orders = [
          {
            _id: order._id,
            price_when_bought: order.price_when_bought,
            has_buyer_received: order.has_buyer_received,
            product_populated: order.product_populated,
            delivery_fee_when_bought: order.delivery_fee_when_bought,
            quantity: order.quantity,
            buyer_desc: order.buyer_desc,
          },
        ];

        groupOrdersPurchasedFromSeller[sellerUsername] = {
          orders,
          seller_info: seller,
        };
      }
    }

    const shortenedConfirmOrderUrls: {
      _id: mongoose.Types.ObjectId;
      url: string;
    }[] = [];
    const getConfirmLinkFromUrls = (id: mongoose.Types.ObjectId) => {
      const confirmLink = shortenedConfirmOrderUrls.find(
        ({ _id }) => _id.toString() === id.toString()
      ) as { url: string };
      return confirmLink.url;
    };

    if (!IS_DEV) {
      const payRes = await axios({
        url: PAYSTACK_HOSTNAME + "/transaction/charge_authorization",
        method: "post",
        headers: {
          ...addPaystackAuth(),
        },
        data: {
          email: buyer.email,
          amount: totalAmountInKobo,
          authorization_code: cardToPayWith.authorization_code,
        },
      });
      if (!payRes.data.status)
        return res
          .status(400)
          .json({ message: "Making order failed. Please try again" });
      await Buyer.findByIdAndUpdate(buyer._id, {
        $set: {
          cart: [],
        },
      });
      await Cart.deleteMany({ buyer: buyer._id });
    }

    const sellerUsernames = Object.keys(groupOrdersPurchasedFromSeller);

    for (let i = 0; i < sellerUsernames.length; i++) {
      const sellerUsername = sellerUsernames[i];
      const { orders, seller_info } = groupOrdersPurchasedFromSeller[
        sellerUsername
      ];
      const orderRef = shortId.generate();

      // TODO: find a better way to know if this is the seller's first order
      const currentCountOfSellerOrders = await Order.countDocuments({
        seller: seller_info._id,
      });

      for (let j = 0; j < orders.length; j++) {
        const order = orders[j];
        const productId = order.product_populated._id;

        const newOrder = new Order({
          confirm_order_url: "",
          ref: orderRef,
          buyer: buyer._id,
          product: productId,
          seller: seller_info._id,
          buyer_desc: order.buyer_desc,
          quantity: order.quantity,
          price_when_bought: order.price_when_bought,
          delivery_fee_when_bought: order.delivery_fee_when_bought,
        });

        order._id = newOrder._id; // because the _id coming from frontend is not valid

        const confirmOrderReceivedLink = getConfirmOrderReceivedLinkForBuyer({
          order_id: newOrder._id,
          store: seller_info.store.shortname,
        });

        const shortenRes = IS_DEV
          ? { short_url: "short_url" }
          : await shortenUrlAndSave(confirmOrderReceivedLink);

        newOrder.confirm_order_url = shortenRes.short_url;

        await newOrder.save();

        shortenedConfirmOrderUrls.push({
          _id: newOrder._id,
          url: shortenRes.short_url,
        });

        if (!IS_DEV) {
          await Product.findByIdAndUpdate(productId, {
            $set: {
              // increase quantity of product sold
              quantity_sold:
                order.product_populated.quantity_sold + order.quantity,
              quantity: order.product_populated.quantity - order.quantity,
            },
          });
        }
      }

      await orderMadeEmailForSeller({
        seller: seller_info,
        buyer,
        orders: groupOrdersPurchasedFromSeller[sellerUsername].orders.map(
          (i) => {
            return {
              product: i.product_populated,
              price_when_bought: i.price_when_bought,
              quantity: i.quantity,
              confirm_order_url: getConfirmLinkFromUrls(i._id),
              buyer_desc: i.buyer_desc,
            };
          }
        ),
        first_purchase: currentCountOfSellerOrders < 1,
        message,
      });

      if (!IS_DEV)
        await smsAfterBuyerMakesOrder({
          buyer: {
            phone: buyer.phone,
          },
          seller: {
            phone: seller_info.whatsapp,
            brand: seller_info.brand_name,
            name: seller_info.fullname,
          },
        });
    }

    await orderMadeEmailForBuyer({
      orders: groupOrdersPurchasedFromSeller,
      price_paid: totalAmount,
      message,
      buyer,
      confirmOrderLinks: shortenedConfirmOrderUrls,
    });

    res.json({ message: "Order completed" });
  } catch (err) {
    console.log(chalk.red("An error occured during making order >>> "), err);
    res.status(500).json({
      message:
        "An error occured. Please try again after few hours to avoid multiple deductions",
    });
  }
}
