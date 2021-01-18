import initiateTransfer from "api/helpers/initiateTransfer";
import verifyAccountNumber from "api/helpers/verifyAccountNumber";
import chalk from "chalk";
import SellerInterface from "interfaces/Seller";
import sellerIssuedAWithdraw from "mails/sellerIssuedAWithdraw";
import Seller from "models/Seller";
import shortid from "shortid";
import addPaystackAuth from "utils/addPaystackAuth";
import { formatCurrency } from "utils/currency";

export default async function withdrawFromWallet(req: any, res: any) {
  const seller = req.user as SellerInterface;
  const { amount: _amount } = req.body as {
    amount: string;
  };

  const amount = parseInt(_amount, 10);

  if (amount === 0)
    return res.status(400).json({
      message: "You cannot withdraw " + formatCurrency(0),
    });

  const amountToStr = amount.toString();

  try {
    if (seller.banks.length === 0)
      res.status(400).json({
        message: "No bank account found",
      });

    const defaultBank = seller.banks.find((a) => a._default === true);
    if (!defaultBank) throw new Error(chalk.red("No bank account found"));

    // verify account number
    const verifyAcctNumberResponse = await verifyAccountNumber({
      account_number: defaultBank.account_number,
      bank_code: defaultBank.bank_code,
    });

    if (verifyAcctNumberResponse.requestSuccessful === false)
      return res.status(400).json({
        message:
          "Bank account is invalid. Please ensure that this account is still open",
      });

    const {
      responseBody: { accountNumber, accountName },
    } = verifyAcctNumberResponse;

    const [naira, kobo] = amountToStr.split(".");

    const amountToPayInKobo =
      kobo === undefined // the amount sent is just the naira format
        ? parseInt(naira, 10) * 100
        : kobo.length === 1 // the amount sent has kobo, but just 1 digit
        ? parseInt(naira, 10) * 10
        : amount;

    const transferReference = shortid.generate();

    const transferRes = await initiateTransfer({
      amount,
      reason: "Seller made withdrawal",
      destination: {
        bank_code: defaultBank.bank_code,
        account_number: defaultBank.account_number,
      },
      reference: transferReference,
    });

    const { requestSuccessful } = transferRes;

    if (!requestSuccessful) throw new Error("Transfer request not successful");

    await Seller.findByIdAndUpdate(seller._id, {
      $set: {
        wallet: {
          balance: seller.wallet.balance - amount,
        },
      },
    });

    res.json({
      message: "Withdraw successful. Money will be in your account soon.",
    });

    await sellerIssuedAWithdraw({ amount, email: seller.email });
  } catch (err) {
    console.log(chalk.red("Could not issue withdrawal >>> "), err);
    res.status(500).json({ message: "An error occured. Please try again" });
  }
}
