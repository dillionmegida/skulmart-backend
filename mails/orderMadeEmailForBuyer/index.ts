import BuyerInterface from "interfaces/Buyer";
import { GroupedOrdersPurchasedFromSeller } from "interfaces/OrderInterface";
import sendMail from "..";
import orderMadeForBuyer from "./template";
import mongoose from "mongoose";
import { format } from "date-fns";

type Args = {
  buyer: BuyerInterface;
  orders: GroupedOrdersPurchasedFromSeller;
  confirmOrderLinks: { _id: mongoose.Types.ObjectId; url: string }[];
  price_paid: number;
  message: string;
};

export default async function orderMadeEmailForBuyer({
  price_paid,
  orders,
  message,
  buyer,
  confirmOrderLinks,
}: Args) {
  const subject = `Order Receipt (${format(new Date(), "do LLL, yyyy")})`;
  const html = orderMadeForBuyer({
    buyerPhone: buyer.phone,
    orders,
    pricePaid: price_paid,
    message,
    emailSubject: subject,
    confirmOrderLinks,
  });

  const mailResponse = await sendMail({
    html,
    receiver: buyer.email,
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
