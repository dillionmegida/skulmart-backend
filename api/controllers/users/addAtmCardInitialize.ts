import axios from "axios";
import chalk from "chalk";
import { PAYSTACK_HOSTNAME } from "constants/index";
import BuyerInterface from "interfaces/Buyer";
import SellerInterface from "interfaces/Seller";
import addPaystackAuth from "utils/addPaystackAuth";

export default async function addAtmCardInitialize(req: any, res: any) {
  const user = req.user as BuyerInterface | SellerInterface;

  const { amount, callback_url } = req.body as {
    amount: number;
    callback_url: string;
  };
  try {
    const payRes = await axios({
      method: "post",
      url: PAYSTACK_HOSTNAME + "/transaction/initialize",
      data: {
        amount,
        email: user.email,
        callback_url,
        channels: ["card"],
      },
      headers: {
        ...addPaystackAuth(),
      },
    });
    res.json({
      payment_link: payRes.data.data.authorization_url,
    });
  } catch (err) {
    console.log(chalk.red("An error occured during adding user ATM card"), err);
    res.status(500).json({
      message: "Error occured. Please try again",
    });
  }
}
