import axios from "axios";
import chalk from "chalk";
import { BEARER_TOKEN, MONIFY_HOSTNAME } from "constants/index";

export default async function getBanks(): Promise<
  | {
      requestSuccessful: true;
      responseMessage: string;
      responseCode: string;
      responseBody: {
        name: string;
        code: string;
        ussdTemplate: string;
        baseUssdCode: string;
        transferUssdTemplate: string;
      }[];
    }
  | { requestSuccessful: false }
> {
  try {
    const response = await axios({
      method: "get",
      url: MONIFY_HOSTNAME + "/banks",
      headers: {
        authorization: await BEARER_TOKEN(),
      },
    });

    if (!response.data.requestSuccessful) return { requestSuccessful: false };

    return response.data;
  } catch (err) {
    console.log(chalk.red("Could not fetch banks"), err);
    return { requestSuccessful: false };
  }
}
