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

export default async function makeOrder(req: any, res: any) {
  const buyer = req.user as BuyerInterface;

  const { orders, message, card_signature } = req.body as {
    message: string;
    orders: OrderInterface[];
    card_signature: string;
  };

  let totalAmount = 0;

  orders.forEach((p) => (totalAmount += p.price_when_bought * p.quantity));

  const totalAmountInKobo = totalAmount * 100;

  const cardToPayWith = buyer.cards.find(
    ({ signature }) => signature === card_signature
  );

  if (!cardToPayWith)
    return res.status(400).json({ message: "Card to pay with does not exist" });

  const groupOrdersPurchasedFromSeller: GroupedOrdersPurchasedFromSeller = {};

  for (let i = 0; i < orders.length; i++) {
    const order = orders[i];
    const sellerUsername =
      process.env.NODE_ENV === "dev"
        ? "deeesigns-studios-sIYE4Ib6T" // in development, I want to use this user for testing
        : order.seller_username;

    const sellerOrders = groupOrdersPurchasedFromSeller[sellerUsername] || null;

    if (sellerOrders) {
      // seller already has item in the group
      sellerOrders.orders.push(order);
    } else {
      const seller = (await Seller.findOne({
        username: sellerUsername,
      }).populate("store")) as SellerInterface & {
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
          quantity: order.quantity,
        },
      ];

      groupOrdersPurchasedFromSeller[sellerUsername] = {
        orders,
        seller_info: seller,
      };
    }
  }

  try {
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

    if (process.env.NODE_ENV !== "dev") {
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
        const newOrder = new Order({
          confirm_order_url: "",
          ref: orderRef,
          buyer: buyer._id,
          product: order.product_populated._id,
          seller: seller_info._id,
          quantity: order.quantity,
          price_when_bought: order.price_when_bought,
        });

        order._id = newOrder._id; // because the _id coming from frontend is not valid

        const confirmOrderReceivedLink = getConfirmOrderReceivedLinkForBuyer({
          order_id: newOrder._id,
          store: seller_info.store.shortname,
        });
        const shortenRes = await shortenUrlAndSave(confirmOrderReceivedLink);

        newOrder.confirm_order_url = shortenRes.short_url;
        
        await newOrder.save();

        shortenedConfirmOrderUrls.push({
          _id: newOrder._id,
          url: shortenRes.short_url,
        });
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
            };
          }
        ),
        first_purchase: currentCountOfSellerOrders < 1,
        message,
      });

      await orderMadeEmailForBuyer({
        orders: groupOrdersPurchasedFromSeller,
        price_paid: totalAmount,
        message,
        buyer,
        confirmOrderLinks: shortenedConfirmOrderUrls,
      });
    }

    res.json({ message: "Order completed" });
  } catch (err) {
    console.log(chalk.red("An error occured during making order >>> "), err);
    res.status(500).json({
      message:
        "An error occured. Please try again after few hours to avoid multiple deductions",
    });
  }
}
