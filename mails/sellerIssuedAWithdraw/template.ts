import { format } from "date-fns";
import Bank from "interfaces/Bank";
import { formatCurrency } from "utils/currency";

type Args = {
  amount: number;
  bank: Bank;
};

export default function sellerIssuedAWithdrawTemplate({ amount, bank }: Args) {
  return `
<div>
  <h2 style='font-size: 20px;'>You issued a withdraw of ${formatCurrency(
    amount
  )} from your wallet on ${format(new Date(), "do LLL, yyyy")}.</h2>
  <p>
    This will be transferred to the bank account you selected when issuing the refund: <b>${
      bank.account_number
    } - ${bank.bank_name}</b>.
  </p>
  <p>
    If you do not get the money in 24 hours, kindly contact us
    so we can assist you. Thank you.
    </p>
</div>
  `;
}
