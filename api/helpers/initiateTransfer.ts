import axios from "axios";
import chalk from "chalk";
import { BASIC_AUTHORIZATION, env, MONIFY_HOSTNAME_V2 } from "constants/index";

type Props = {
  amount: number;
  reference: string;
  reason?: string;
  destination: {
    bank_code: string;
    account_number: string;
  };
};

export default async function initiateTransfer({
  amount,
  reference,
  reason = "Initiate transfer",
  destination,
}: Props): Promise<
  | {
      requestSuccessful: true;
      responseMessage: string;
      responseCode: string;
      responseBody: {
        amount: number;
        reference: string;
        status: string;
        dateCreated: Date;
        totalFee: number;
      };
    }
  | { requestSuccessful: false }
> {
  try {
    const res = await axios({
      url: MONIFY_HOSTNAME_V2 + "/disbursements/single",
      data: {
        amount,
        reference,
        narration: reason,
        destinationBankCode: destination.bank_code,
        destinationAccountNumber: destination.account_number,
        currency: "NGN",
        sourceAccountNumber: env.MONIFY_ACCOUNT_NUMBER,
      },
      headers: {
        authoriation: BASIC_AUTHORIZATION,
      },
      method: "post",
    });
    return res.data;
  } catch (err) {
    console.log(chalk.red("Could not initiate transfer >> "), err);
    return { requestSuccessful: false };
  }
}
