import { formatCurrency } from "utils/currency";

type Args = {
  amount: number;
};

export default function sellerIssuedAWithdrawTemplate({ amount }: Args) {
  return `
<div>
  <h2 style='font-size: 20px;'>You issued a refund of ${formatCurrency(
    amount
  )} from your wallet.</h2>
  <p>
    This will be transferred to the default bank account you provided
    in your dashboard.
  </p>
  <p>
    If you do not get the refund in 24 hours, kindly contact us
    so we can assist you. Thank you.
    </p>
</div>
  `;
}
