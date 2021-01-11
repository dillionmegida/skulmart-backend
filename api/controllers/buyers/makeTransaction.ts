import axios from "axios";
import chalk from "chalk";
import { PAYSTACK_HOSTNAME } from "constants/index";
import BuyerInterface from "interfaces/Buyer";
import SellerInterface from "interfaces/Seller";
import TransactionInterface from "interfaces/TransactionInterface";
import addPaystackAuth from "utils/addPaystackAuth";

export default async function makeTransaction(req: any, res: any) {
  const user = req.user as BuyerInterface | SellerInterface;

  const { first_charge = false } = req.query as {
    first_charge: boolean;
  };

  const { account_number, transaction, message } = req.body as {
    account_number: string;
    message: string;
    transaction: TransactionInterface;
  };

  let totalAmount = 100;

  // transaction.products.forEach((p) => (totalAmount += p.price_when_bought));

  const bankToPayWith = user.banks.find(
    ({ account_number: acctNumber }) => acctNumber === account_number
  );

  if (!bankToPayWith)
    return res
      .status(400)
      .json({ message: "Bank account to pay with does not exist" });

  try {
    const payRes = await axios({
      url: PAYSTACK_HOSTNAME + "/charge",
      method: "post",
      headers: {
        ...addPaystackAuth(),
      },
      data: {
        email: user.email,
        amount: totalAmount,
        bank: {
          code: bankToPayWith.bank_code,
          account_number,
        },
      },
    });
  } catch (err) {
    console.log({ payRes: err.response.data.data });
    console.log(
      chalk.red("An error occured during making transaction >>> "),
      err
    );
    res.status(500).json({
      message:
        "An error occured. Please try again after few hours to avoid multiple deductions",
    });
  }
}
