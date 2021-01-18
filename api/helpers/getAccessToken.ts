import axios from "axios";
import chalk from "chalk";
import { BASIC_AUTHORIZATION, MONIFY_HOSTNAME } from "constants/index";

export default async function getAccessToken(): Promise<
  | {
      requestSuccessful: true;
      responseMessage: string;
      responseCode: string;
      responseBody: {
        accessToken: string;
        expiresIn: number;
      };
    }
  | { requestSuccessful: false }
> {
  try {
    const response = await axios({
      url: MONIFY_HOSTNAME + "/auth/login",
      headers: { authorization: BASIC_AUTHORIZATION },
      method: "post",
    });
    return response.data;
  } catch (err) {
    console.log(chalk.red("An error occured during getting access token"), err);
    return { requestSuccessful: false };
  }
}
