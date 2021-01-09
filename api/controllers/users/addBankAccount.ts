import axios from "axios";
import bodyParser from "body-parser";
import chalk from "chalk";
import { PAYSTACK_HOSTNAME } from "constants/index";
import BuyerInterface from "interfaces/Buyer";
import SellerInterface from "interfaces/Seller";
import Buyer from "models/Buyer";
import addPaystackAuth from "utils/addPaystackAuth";

export default async function addBankAccount(req: any, res: any) {
  const user = req.user as BuyerInterface | SellerInterface;

  const { bank_code, account_number, bank_name } = req.body as {
    account_number: string;
    bank_code: string;
    bank_name: string;
  };

  try {
    const resolveResponse = await axios({
      method: "GET",
      url:
        PAYSTACK_HOSTNAME +
        "/bank/resolve?account_number=" +
        account_number +
        "&bank_code=" +
        bank_code,
      headers: {
        ...addPaystackAuth(),
      },
    });

    const { data } = resolveResponse;

    if (data.status === false)
      return res.status(400).json({
        message:
          "Bank account provided is not yours. Please provide valid credentials",
      });

    const existingBanks = [...user.banks];
    const doesNewBankExist =
      existingBanks.findIndex(
        ({ account_number: accountNumber }) => accountNumber === account_number
      ) !== -1;

    if (doesNewBankExist)
      return res.status(400).json({
        message: "This bank account has been saved already",
      });

    if (user.user_type === "buyer") {
      await Buyer.findByIdAndUpdate(user._id, {
        $set: {
          banks: existingBanks.concat({
            account_name: data.data.account_name,
            account_number: data.data.account_number,
            bank_code,
            bank_name,
          }),
        },
      });
    } else {
    }

    res.json({
      message: "Bank account verified successfully",
      data: {
        bank_name,
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
