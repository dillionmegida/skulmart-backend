import axios from "axios";
import chalk from "chalk";
import { TERMII_API_KEY, TERMII_API } from "constants/index";

type Args = {
  recipient_num: string;
  sender_name: string;
  message: string;
};
export default async function sendTextMessage({
  recipient_num,
  sender_name,
  message,
}: Args): Promise<
  | {
      status: false;
    }
  | {
      message_id: string;
      message: string;
      balance: number;
      user: string;
    }
> {
  try {
    const response = await axios({
      method: "post",
      url: TERMII_API + "/sms/send",
      data: {
        to: recipient_num,
        from: sender_name,
        sms: message,
        type: "plain",
        api_key: TERMII_API_KEY,
        channel: "generic",
      },
    });
    return { status: true, ...response.data };
  } catch (err) {
    console.log(chalk.red("An error while sending SMS >> "), err);
    return { status: false };
  }
}
