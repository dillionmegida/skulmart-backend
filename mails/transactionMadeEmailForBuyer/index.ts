import BuyerInterface from "interfaces/Buyer";
import { GroupedItemsPurchasedBySeller } from "interfaces/TransactionInterface";
import sendMail from "../";
import transactionMadeForBuyer from "./template";

type Args = {
  buyer: BuyerInterface;
  items: GroupedItemsPurchasedBySeller;
  price_paid: number;
  message: string;
};

export default async function transactionMadeEmailForBuyer({
  price_paid,
  items,
  message,
  buyer,
}: Args) {
  const subject = `Order Receipt`;
  const html = transactionMadeForBuyer({
    buyerPhone: buyer.phone,
    items,
    pricePaid: price_paid,
    message,
    emailSubject: subject,
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
