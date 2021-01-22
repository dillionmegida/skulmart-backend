import axios from "axios";
import chalk from "chalk";
import { PAYSTACK_HOSTNAME } from "constants/index";
import addPaystackAuth from "utils/addPaystackAuth";

export default async function getBanks(): Promise<
  | {
      status: true;
      data: {
        name: string;
        code: string;
      }[];
    }
  | { status: false }
> {
  try {
    const response = await axios({
      method: "get",
      url: PAYSTACK_HOSTNAME + "/bank",
      headers: {
        ...addPaystackAuth(),
      },
    });

    if (!response.data.status) return { status: false };

    return response.data;
  } catch (err) {
    console.log(chalk.red("Could not fetch banks"), err);
    return { status: false };
  }
}
