import sendMail from "..";
import startNegotiationTemplate from "./startNegotiationTemplate";

type Args = {
  product: { name: string };
  buyer: { name: string };
  seller: { email: string };
};

export default async function buyerStartsANegotiationMail({
  product: { name: productName },
  buyer: { name: buyerName },
  seller: { email: sellerEmail },
}: Args) {
  const subject = `${buyerName} wants to negotiate ${productName}`;

  const html = startNegotiationTemplate({ emailSubject: subject });

  const mailResponse = await sendMail({
    html,
    receiver: sellerEmail,
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
