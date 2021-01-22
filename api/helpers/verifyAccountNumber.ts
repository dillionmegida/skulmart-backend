import axios from "axios";
import chalk from "chalk";
import { PAYSTACK_HOSTNAME } from "constants/index";
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
      status: true;
      data: { account_number: string; account_name: string };
    }
  | {
      status: false;
    }
> {
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

    if (data.status === false) return { status: false };

    return {
      status: true,
      data: data.data,
    };
  } catch (err) {
    console.log(
      chalk.red("Error occured during account number verification"),
      err
    );
    return { status: false };
  }
}
