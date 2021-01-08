import BuyerInterface from "interfaces/Buyer";
import ProductInterface from "interfaces/Product";
import SellerInterface from "interfaces/Seller";
import StoreInterface from "interfaces/Store";
import TransactionInterface, {
  GroupedItemsPurchasedBySeller,
} from "interfaces/TransactionInterface";
import transactionMadeEmailForBuyer from "mails/transactionMadeEmailForBuyer";
import transactionMadeEmailForSeller from "mails/transactionMadeEmailForSeller";
import Seller from "models/Seller";

export default async function makeTransaction(req: any, res: any) {
  const { transaction, message } = req.body as {
    transaction: TransactionInterface;
    message: string;
  };

  const { buyer_phone, price_paid } = transaction;

  const buyer = req.user as BuyerInterface;

  const groupItemsPurchasedBySeller: GroupedItemsPurchasedBySeller = {
    // deeesignsstudios: {
    //   items: [],
    //   seller_info: {} as SellerInterface & { store: StoreInterface },
    // },
  };

  for (let i = 0; i < transaction.products.length; i++) {
    const itemInTransaction = transaction.products[i];
    const sellerUsername = itemInTransaction.seller.username;

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
          has_buyer_paid: itemInTransaction.has_buyer_paid,
          has_buyer_received: itemInTransaction.has_buyer_received,
          product: itemInTransaction.product,
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

  // TODO: delete all cart items
  // but watch out if they checked out on all cart items or just checked out on a product

  const sellerUsernames = Object.keys(groupItemsPurchasedBySeller);

  for (let i = 0; i < sellerUsernames.length; i++) {
    const sellerUsername = sellerUsernames[i];
    const items = groupItemsPurchasedBySeller[sellerUsername];
    await transactionMadeEmailForSeller({
      seller: items.seller_info as SellerInterface,
      buyer,
      buyer_phone,
      items: groupItemsPurchasedBySeller[sellerUsername].items.map((i) => ({
        product: i.product,
        price_when_bought: i.price_when_bought,
        quantity: i.quantity,
      })),
      message,
    });
  }

  await transactionMadeEmailForBuyer({
    buyer_phone,
    items: groupItemsPurchasedBySeller,
    price_paid,
    message,
    buyer,
  });

  res.json({
    message:
      "Successfully purchased products. Kindly wait for the respective sellers to contact you on " +
      transaction.buyer_phone,
  });
}
