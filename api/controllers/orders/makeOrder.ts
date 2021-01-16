import chalk from "chalk";
import BuyerInterface from "interfaces/Buyer";
import SellerInterface from "interfaces/Seller";
import StoreInterface from "interfaces/Store";
import OrderInterface, {
  GroupedItemsPurchasedBySeller,
} from "interfaces/OrderInterface";
import Seller from "models/Seller";
import Order from "models/Order";
import shortId from "shortid";

export default async function makeOrder(req: any, res: any) {
  const buyer = req.user as BuyerInterface;

  const { orders, message, card_signature } = req.body as {
    message: string;
    orders: OrderInterface[];
    card_signature: string;
  };

  let totalAmount = 50;

  // orders.forEach((p) => (totalAmount += p.price_when_bought));

  const totalAmountInKobo = totalAmount * 100;

  const cardToPayWith = buyer.cards.find(
    ({ signature }) => signature === card_signature
  );

  if (!cardToPayWith)
    return res.status(400).json({ message: "Card to pay with does not exist" });

  const groupItemsPurchasedBySeller: GroupedItemsPurchasedBySeller = {};

  for (let i = 0; i < orders.length; i++) {
    const order = orders[i];
    const sellerUsername = order.seller_username;

    const sellerItems =
      process.env.NODE_ENV === "development"
        ? groupItemsPurchasedBySeller.deeesignsstudios // in development, I want to use this user for testing
        : groupItemsPurchasedBySeller[sellerUsername] || null;

    if (sellerItems) {
      // seller already has item in the group
      sellerItems.items.push(order);
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

      const items = [
        {
          price_when_bought: order.price_when_bought,
          has_buyer_received: order.has_buyer_received,
          product_populated: order.product_populated,
          quantity: order.quantity,
        },
      ];

      if (process.env.NODE_ENV === "development") {
        // use this user for testing
        groupItemsPurchasedBySeller.deeesignsstudios = {
          items,
          seller_info: ((await Seller.findOne({
            username: "deeesignsstudios",
          })) as SellerInterface).populate("store") as SellerInterface & {
            store: StoreInterface;
          },
        };
      } else {
        groupItemsPurchasedBySeller[sellerUsername] = {
          items,
          seller_info: seller,
        };
      }
    }
  }

  try {
    // const payRes = await axios({
    //   url: PAYSTACK_HOSTNAME + "/transaction/charge_authorization",
    //   method: "post",
    //   headers: {
    //     ...addPaystackAuth(),
    //   },
    //   data: {
    //     email: buyer.email,
    //     amount: totalAmountInKobo,
    //     authorization_code: cardToPayWith.authorization_code,
    //   },
    // });

    // if (!payRes.data.status)
    //   return res
    //     .status(400)
    //     .json({ message: "Making order failed. Please try again" });

    // TODO: delete all cart items

    const sellerUsernames = Object.keys(groupItemsPurchasedBySeller);

    for (let i = 0; i < sellerUsernames.length; i++) {
      const sellerUsername = sellerUsernames[i];
      const { items, seller_info } = groupItemsPurchasedBySeller[
        sellerUsername
      ];

      const orderRef = shortId.generate();

      for (let j = 0; j < items.length; j++) {
        const item = items[j];
        const newOrder = new Order({
          ref: orderRef,
          buyer: buyer._id,
          product: item.product_populated._id,
          seller: seller_info._id,
          quantity: item.quantity,
          price_when_bought: item.price_when_bought,
        });

        await newOrder.save();
      }

      // await orderMadeEmailForSeller({
      //   seller: seller_info,
      //   buyer,
      //   items: groupItemsPurchasedBySeller[sellerUsername].items.map((i) => ({
      //     product: i.product_populated,
      //     price_when_bought: i.price_when_bought,
      //     quantity: i.quantity,
      //   })),
      //   // first_purchase
      //   message,
      // });
    }

    // await orderMadeEmailForBuyer({
    //   items: groupItemsPurchasedBySeller,
    //   price_paid: totalAmount,
    //   message,
    //   buyer,
    // });

    res.json({ message: "Order completed" });
  } catch (err) {
    console.log(chalk.red("An error occured during making order >>> "), err);
    res.status(500).json({
      message:
        "An error occured. Please try again after few hours to avoid multiple deductions",
    });
  }
}
