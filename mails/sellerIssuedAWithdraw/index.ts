import sendMail from "..";
import mailTemplate from "./template";

type Args = {
  amount: number;
  email: string;
};

export default async function sellerIssuedAWithdraw({ amount, email }: Args) {
  const subject = `You issued a refund from your wallet 🤑`;
  const html = mailTemplate({
    amount,
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
