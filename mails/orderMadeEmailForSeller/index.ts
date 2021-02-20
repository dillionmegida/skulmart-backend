import { format } from "date-fns";
import BuyerInterface from "interfaces/Buyer";
import ProductInterface from "interfaces/Product";
import SellerInterface from "interfaces/Seller";
import { formatDate } from "utils/dateFormatter";
import sendMail from "..";
import mailTemplate from "./template";

type Args = {
  seller: SellerInterface;
  buyer: BuyerInterface;
  orders: {
    product: ProductInterface;
    quantity: number;
    price_when_bought: number;
    confirm_order_url: string;
  }[];
  message: string;
  first_purchase?: boolean;
};

export default async function orderMadeEmailForSeller({
  seller,
  buyer,
  orders,
  message,
  first_purchase,
}: Args) {
  const subject = first_purchase
    ? `Congratulations on your first sales 🎉`
    : `Someone purchased from your store (${
        seller.brand_name
      }) 🎉 - ${formatDate()}`;
  const html = mailTemplate({
    buyer: {
      name: buyer.fullname,
      phone: buyer.phone,
    },
    orders: orders.map((i) => ({
      name: i.product.name,
      quantity: i.quantity,
      price: i.price_when_bought,
      confirm_order_url: i.confirm_order_url,
      product: {
        quantity_available: i.product.quantity,
      },
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
