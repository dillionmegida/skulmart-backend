import axios from "axios";
import chalk from "chalk";
import { MONIFY_HOSTNAME } from "constants/index";
import addPaystackAuth from "utils/addPaystackAuth";

type Args = {
  account_number: string;
  bank_code: string;
};

export default async function verifyAccountNumber({
  account_number,
  bank_code,
}: Args): Promise<
  | {
      requestSuccessful: true;
      responseMessage: string;
      responseCode: string;
      responseBody: {
        accountNumber: string;
        accountName: string;
      };
    }
  | {
      requestSuccessful: false;
    }
> {
  try {
    const resolveResponse = await axios({
      method: "GET",
      url:
        MONIFY_HOSTNAME +
        "/disbursements/account/validate?accountNumber=" +
        account_number +
        "&bankCode=" +
        bank_code,
    });

    const { data } = resolveResponse;

    if (data.status === false) return { requestSuccessful: false };

    return {
      requestSuccessful: true,
      responseMessage: data.responseMessage,
      responseCode: data.responseCode,
      responseBody: data.responseBody,
    };
  } catch (err) {
    console.log(
      chalk.red("Error occured during verifying account number"),
      err
    );
    return { requestSuccessful: false };
  }
}
