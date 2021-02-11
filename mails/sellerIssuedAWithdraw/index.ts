import sendMail from "..";
import mailTemplate from "./template";
import { format } from "date-fns";
import Bank from "interfaces/Bank";

type Args = {
  amount: number;
  email: string;
  bank: Bank
};

export default async function sellerIssuedAWithdraw({ amount, email, bank }: Args) {
  const subject = `You issued a withdraw from your wallet 🤑 (${format(
    new Date(),
    "do LLL, yyyy"
  )})`;
  const html = mailTemplate({
    amount,
    bank
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
