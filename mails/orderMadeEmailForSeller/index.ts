import BuyerInterface from "interfaces/Buyer";
import ProductInterface from "interfaces/Product";
import SellerInterface from "interfaces/Seller";
import sendMail from "..";
import orderMadeForSeller from "./template";

type Args = {
  seller: SellerInterface;
  buyer: BuyerInterface;
  items: {
    product: ProductInterface;
    quantity: number;
    price_when_bought: number;
  }[];
  message: string;
  first_purchase?: boolean;
};

export default async function orderMadeEmailForSeller({
  seller,
  buyer,
  items,
  message,
  first_purchase,
}: Args) {
  const subject = first_purchase
    ? `Congratulations on your first sales 🎉`
    : `Someone purchased from your store (${seller.brand_name}) 🎉`;
  const html = orderMadeForSeller({
    buyer: {
      name: buyer.fullname,
      phone: buyer.phone,
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
