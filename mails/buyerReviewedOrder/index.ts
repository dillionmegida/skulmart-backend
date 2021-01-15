import BuyerInterface from "interfaces/Buyer";
import SellerInterface from "interfaces/Seller";
import sendMail from "..";
import mailTemplate from "./template";

type Args = {
  seller: SellerInterface;
  buyer: BuyerInterface;
  rating: number;
  review: string;
};

export default async function buyerReviewedOrder({
  seller,
  buyer,
  rating,
  review,
}: Args) {
  const subject = `Someone wrote a review about an order. Check it out`;
  const { email } = seller;
  const html = mailTemplate({
    buyer_name: buyer.fullname,
    rating,
    review,
  });

  const mailResponse = await sendMail({
    html,
    receiver: email,
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
