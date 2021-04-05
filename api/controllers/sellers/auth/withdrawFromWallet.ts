import initiateTransfer from "api/helpers/initiateTransfer";
import verifyAccountNumber from "api/helpers/verifyAccountNumber";
import chalk from "chalk";
import SellerInterface from "interfaces/Seller";
import sellerIssuedAWithdraw from "mails/sellerIssuedAWithdraw";
import Seller from "models/Seller";
import { saveActivity } from "utils/activities";
import { chargeOnTransfer } from "utils/chargeFee";
import { formatCurrency } from "utils/currency";
import { convertToKobo } from "utils/money";
import { allParametersExist } from "utils/validateBodyParameters";

export default async function withdrawFromWallet(req: any, res: any) {
  const seller = req.user as SellerInterface;

  try {
    allParametersExist(req.body, "amount", "account_number");

    const { amount: _amount, account_number } = req.body as {
      amount: string;
      account_number: string;
    };

    if (!seller.wallet.last_income)
      return res.status(400).json({
        message:
          "You cannot withdraw because you have not received any income.",
      });

    const amount = parseInt(_amount, 10);

    if (isNaN(amount) || amount === 0)
      return res.status(400).json({
        message: "You cannot withdraw " + formatCurrency(0),
      });

    if (amount > seller.wallet.balance)
      return res.status(400).json({
        message:
          "You cannot withdraw more than your current balance (" +
          formatCurrency(seller.wallet.balance) +
          ")",
      });

    const amountToWithdraw =
      !seller.wallet.last_withdraw || // then seller has not withdrawn before
      (seller.wallet.last_income as Date) > seller.wallet.last_withdraw // seller has not withdrawn since new income
        ? amount // free withdraw
        : amount - chargeOnTransfer(amount).fee;

    const amountToWithdrawInKobo = convertToKobo(amountToWithdraw);

    if (seller.banks.length === 0)
      return res.status(400).json({
        message: "No bank account found",
      });

    const selectedBank = seller.banks.find(
      (b) => b.account_number === account_number
    );

    if (!selectedBank)
      return res
        .status(400)
        .json({ message: "Selected bank account does not exist" });

    // verify account number
    const verifyAcctNumberResponse = await verifyAccountNumber({
      account_number: selectedBank.account_number,
      bank_code: selectedBank.bank_code,
    });

    if (verifyAcctNumberResponse.status === false)
      return res.status(400).json({
        message:
          "Bank account is invalid. Please ensure that this account is still open",
      });

    const transferRes = await initiateTransfer({
      amount: amountToWithdrawInKobo,
      reason: "Withdrawal " + seller.fullname,
      destination: {
        bank_code: selectedBank.bank_code,
        account_number: selectedBank.account_number,
        account_name: selectedBank.account_name,
      },
    });

    const { status } = transferRes;

    if (!status) throw new Error("Transfer request not successful");

    await Seller.findByIdAndUpdate(seller._id, {
      $set: {
        wallet: {
          balance: seller.wallet.balance - amount,
          last_withdraw: new Date(),
          last_income: seller.wallet.last_income,
        },
      },
    });

    await saveActivity({
      type: "MONEY_WITHDRAWN",
      options: {
        amount,
        seller_id: seller._id,
      },
    });

    res.json({
      message: "Withdraw successful. Money will be in your account soon.",
    });

    await sellerIssuedAWithdraw({
      amount,
      email: seller.email,
      bank: selectedBank,
    });
  } catch (err) {
    console.log(chalk.red("Could not issue withdrawal >>> "), err);
    res.status(500).json({ message: "An error occured. Please try again" });
  }
}
