import BuyerInterface from "interfaces/Buyer";
import OrderInterface from "interfaces/OrderInterface";
import ProductInterface from "interfaces/Product";
import SellerInterface from "interfaces/Seller";
import sendMail from "..";
import mailTemplate from "./template";

type Args = {
  order: OrderInterface;
  product: ProductInterface;
  buyer: BuyerInterface;
  seller: SellerInterface;
  seller_rating: number;
  seller_review: string;
};

export default async function buyerHasReceivedOrder({
  order,
  product,
  buyer,
  seller,
  seller_rating,
  seller_review,
}: Args) {
  const { fullname: buyerFullname } = buyer;
  const { email } = seller;
  const subject = `${buyerFullname} has received their order 😊`;
  const html = mailTemplate({
    order,
    emailSubject: subject,
    product,
    seller_rating,
    seller_review,
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
