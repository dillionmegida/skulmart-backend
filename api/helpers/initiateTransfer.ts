import axios from "axios";
import chalk from "chalk";
import { PAYSTACK_HOSTNAME } from "constants/index";
import OrderInterface from "interfaces/OrderInterface";
import Order from "models/Order";
import addPaystackAuth from "utils/addPaystackAuth";
import { convertToKobo } from "utils/money";

type Args = {
  amount: number;
  reference: string;
  reason?: string;
  destination: {
    bank_code: string;
    account_number: string;
    account_name: string;
  };
};

export default async function initiateTransfer({
  amount,
  reason = "Initiate transfer",
  destination: { bank_code, account_number, account_name },
  reference,
}: Args): Promise<
  | {
      status: true;
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
  | { status: false }
> {
  const amountToPayInKobo = convertToKobo(amount);

  try {
    // create transfer receipt
    const transferReceiptResponse = await axios({
      method: "post",
      url: PAYSTACK_HOSTNAME + "/transferrecipient",
      headers: {
        ...addPaystackAuth(),
      },
      data: {
        type: "nuban",
        bank_code,
        account_number,
        name: account_name,
      },
    });

    if (transferReceiptResponse.data.status === false)
      throw new Error("Transfer receipt could not be created");

    const { recipient_code } = transferReceiptResponse.data.data;

    // initiate transfer
    const res = await axios({
      method: "post",
      url: PAYSTACK_HOSTNAME + "/transfer",
      headers: {
        ...addPaystackAuth(),
      },
      data: {
        source: "balance",
        amount: amountToPayInKobo,
        recipient: recipient_code,
        reason,
        reference,
      },
    });

    return res.data;
  } catch (err) {
    console.log(chalk.red("Could not initiate transfer >> "), err);
    return { status: false };
  }
}
