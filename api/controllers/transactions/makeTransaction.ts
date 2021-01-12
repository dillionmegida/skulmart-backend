import axios from "axios";
import chalk from "chalk";
import { PAYSTACK_HOSTNAME } from "constants/index";
import BuyerInterface from "interfaces/Buyer";
import SellerInterface from "interfaces/Seller";
import StoreInterface from "interfaces/Store";
import TransactionInterface, {
  GroupedItemsPurchasedBySeller,
} from "interfaces/TransactionInterface";
import transactionMadeEmailForBuyer from "mails/transactionMadeEmailForBuyer";
import transactionMadeEmailForSeller from "mails/transactionMadeEmailForSeller";
import Seller from "models/Seller";
import Transaction from "models/Transaction";
import addPaystackAuth from "utils/addPaystackAuth";
import shortId from "shortid";

export default async function makeTransaction(req: any, res: any) {
  const buyer = req.user as BuyerInterface;

  const { orders, message, card_signature } = req.body as {
    message: string;
    orders: TransactionInterface[];
    card_signature: string;
  };

  let totalAmount = 50;
  
  // transaction.products.forEach((p) => (totalAmount += p.price_when_bought));

  const  totalAmountInKobo = totalAmount * 100;

  const cardToPayWith = buyer.cards.find(
    ({ signature }) => signature === card_signature
  );

  if (!cardToPayWith)
    return res.status(400).json({ message: "Card to pay with does not exist" });

  const groupItemsPurchasedBySeller: GroupedItemsPurchasedBySeller = {};

  for (let i = 0; i < orders.length; i++) {
    const itemInTransaction = orders[i];
    const sellerUsername = itemInTransaction.seller_username;

    // const sellerItems = groupItemsPurchasedBySeller[sellerUsername] || null;
    const sellerItems = groupItemsPurchasedBySeller.deeesignsstudios;

    if (sellerItems) {
      // seller already has item in the group
      sellerItems.items.push(itemInTransaction);
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
          price_when_bought: itemInTransaction.price_when_bought,
          has_buyer_received: itemInTransaction.has_buyer_received,
          product_populated: itemInTransaction.product_populated,
          quantity: itemInTransaction.quantity,
        },
      ];
      // groupItemsPurchasedBySeller[sellerUsername] = {
      //   items,
      //   seller_info: seller,
      // };

      groupItemsPurchasedBySeller.deeesignsstudios = {
        items,
        seller_info: ((await Seller.findOne({
          username: "deeesignsstudios",
        })) as SellerInterface).populate("store") as SellerInterface & {
          store: StoreInterface;
        },
      };
    }
  }

  try {
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
        .json({ message: "Transaction failed. Please try again" });

    // TODO: delete all cart items

    const sellerUsernames = Object.keys(groupItemsPurchasedBySeller);

    for (let i = 0; i < sellerUsernames.length; i++) {
      const sellerUsername = sellerUsernames[i];
      const { items, seller_info } = groupItemsPurchasedBySeller[
        sellerUsername
      ];

      const transactionRef = shortId.generate();

      for (let j = 0; j < items.length; j++) {
        const item = items[j];
        const newTransaction = new Transaction({
          ref: transactionRef,
          buyer: buyer._id,
          product: item.product_populated._id,
          seller: seller_info._id,
          quantity: item.quantity,
          price_when_bought: item.price_when_bought,
        });

        await newTransaction.save();
      }

      await transactionMadeEmailForSeller({
        seller: seller_info,
        buyer,
        items: groupItemsPurchasedBySeller[sellerUsername].items.map((i) => ({
          product: i.product_populated,
          price_when_bought: i.price_when_bought,
          quantity: i.quantity,
        })),
        // first_purchase
        message,
      });
    }

    await transactionMadeEmailForBuyer({
      items: groupItemsPurchasedBySeller,
      price_paid: totalAmount,
      message,
      buyer,
    });

    res.json({ message: "Transaction completed" });
  } catch (err) {
    console.log(
      chalk.red("An error occured during making transaction >>> "),
      err
    );
    res.status(500).json({
      message:
        "An error occured. Please try again after few hours to avoid multiple deductions",
    });
  }
}
