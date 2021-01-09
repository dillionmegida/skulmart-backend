import axios from "axios";
import chalk from "chalk";
import { PAYSTACK_HOSTNAME } from "constants/index";
import addPaystackAuth from "utils/addPaystackAuth";

export default async function getBanks(req: any, res: any) {
  try {
    const allBanksResponse = await axios({
      method: "get",
      url: PAYSTACK_HOSTNAME + "/bank" + "?pay_with_bank=true",
      headers: {
        ...addPaystackAuth(),
      },
    });

    if (!allBanksResponse.data.status)
      return res.status(500).json({
        message: "Error occured. Please try again",
      });

    res.json({ banks: allBanksResponse.data.data });
  } catch (err) {
    console.log(
      chalk.red("An error occured during fetching of banks >> "),
      err
    );
    res.status(500).json({
      error: err,
      message: "Error occured. Please try again",
    });
  }
}
