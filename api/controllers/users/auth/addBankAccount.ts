import verifyAccountNumber from "api/helpers/verifyAccountNumber";
import chalk from "chalk";
import BuyerInterface from "interfaces/Buyer";
import SellerInterface from "interfaces/Seller";
import Buyer from "models/Buyer";
import Seller from "models/Seller";

export default async function addBankAccount(req: any, res: any) {
  const user = req.user as BuyerInterface | SellerInterface;

  const { bank_code, account_number, bank_name } = req.body as {
    account_number: string;
    bank_code: string;
    bank_name: string;
  };

  try {
    const resolveResponse = await verifyAccountNumber({
      account_number,
      bank_code,
    });

    if (resolveResponse.requestSuccessful === false)
      return res.status(400).json({
        message:
          "Bank account provided is not yours. Please provide valid credentials",
      });

    const {
      responseBody: { accountNumber, accountName },
    } = resolveResponse;

    const existingBanks = [...user.banks];
    const doesNewBankExist =
      existingBanks.findIndex(
        ({ account_number }) => accountNumber === account_number
      ) !== -1;

    if (doesNewBankExist)
      return res.status(400).json({
        message: "This bank account has been saved already",
      });

    if (user.user_type === "buyer") {
      await Buyer.findByIdAndUpdate(user._id, {
        $set: {
          banks: existingBanks.concat({
            account_name: accountName,
            account_number: accountNumber,
            bank_code,
            bank_name,
            _default: user.banks.length === 0,
            // default if there was no bank before
          }),
        },
      });
    } else {
      await Seller.findByIdAndUpdate(user._id, {
        $set: {
          banks: existingBanks.concat({
            account_name: accountName,
            account_number: accountNumber,
            bank_code,
            bank_name,
            _default: user.banks.length === 0,
            // default if there was no bank before
          }),
        },
      });
    }

    res.json({
      message: "Bank account verified successfully",
      data: {
        bank_name,
        account_name: accountName,
      },
    });
  } catch (err) {
    console.log(
      chalk.red("An error occured while adding a bank account >> "),
      err
    );
    if (!err.response.data.status)
      return res.status(400).json({
        message:
          "Bank account provided is not yours. Please provide valid credentials",
      });

    res.status(500).json({
      error: err,
      message: "Error occured. Please try again",
    });
  }
}
