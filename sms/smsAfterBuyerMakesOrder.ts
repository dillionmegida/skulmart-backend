import sendTextMessage from "api/helpers/sendTextMessage";
import chalk from "chalk";
import { getAcceptablePhoneNo } from "utils/phoneNo";

type Args = {
  buyer: {
    phone: string;
  };
  seller: {
    phone: string;
    name: string;
    brand: string;
  };
};
export default async function smsAfterBuyerMakesOrder({
  buyer: { phone: buyer_phone },
  seller: { phone: seller_phone, brand, name: seller_name },
}: Args) {
  const buyerPhone = getAcceptablePhoneNo(buyer_phone);
  const sellerPhone = getAcceptablePhoneNo(seller_phone);

  const messageForBuyer =
    "You just made an order from " +
    brand +
    " store. They'd contact you on " +
    buyer_phone +
    " to discuss the delivery process.";

  const messageForSeller =
    "A buyer just made an order. Please check your email for the order details & call the buyer on " +
    buyer_phone +
    " to discuss the delivery process.";

  try {
    await sendTextMessage({
      recipient_num: buyerPhone,
      message: messageForBuyer,
    });

    await sendTextMessage({
      recipient_num: sellerPhone,
      message: messageForSeller,
    });
  } catch (err) {
    console.log(
      chalk.red("An error while sending SMS after buyer made order >> "),
      err
    );
  }
}
