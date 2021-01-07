import BuyerInterface from "interfaces/Buyer";
import ProductInterface from "interfaces/Product";
import SellerInterface from "interfaces/Seller";
import sendMail from "../";
import transactionMadeForSeller from "./template";

type Args = {
  seller: SellerInterface;
  buyer: BuyerInterface;
  items: {
    product: ProductInterface;
    quantity: number;
    price_when_bought: number;
  }[];
  buyer_phone: string;
  message: string;
};

export default async function transactionMadeEmailForSeller({
  seller,
  buyer_phone,
  buyer,
  items,
  message,
}: Args) {
  const subject = `Someone purchased from your store (${seller.brand_name}) 🎉`;
  const html = transactionMadeForSeller({
    buyer: {
      name: buyer.fullname,
      phone: buyer_phone,
    },
    products: items.map((i) => ({
      name: i.product.name,
      quantity: i.quantity,
      price: i.price_when_bought,
    })),
    message,
  });

  const mailResponse = await sendMail({
    html,
    receiver: seller.email,
    subject,
  });

  if (mailResponse.err) {
    // then email couldn't send
    return {
      error: mailResponse.err,
    };
  }

  return {
    message: mailResponse.message,
  };
}
