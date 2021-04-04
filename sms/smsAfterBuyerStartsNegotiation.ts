import sendTextMessage from "api/helpers/sendTextMessage";
import { consoleMessage } from "utils/logs";
import { getAcceptablePhoneNo } from "utils/phoneNo";

type Args = {
  buyer: {
    name: string;
  };
  product: {
    name: string;
  };
  seller: {
    phone: string;
  };
};
export default async function smsAfterBuyerStartsNegotiation({
  buyer: { name: buyer_name },
  seller: { phone: seller_phone },
  product: { name: product_name },
}: Args) {
  const sellerPhone = getAcceptablePhoneNo(seller_phone);

  const messageForSeller =
    buyer_name + " wants to negotiate " + product_name + ". Check your email.";

  try {
    await sendTextMessage({
      recipient_num: sellerPhone,
      message: messageForSeller,
    });
  } catch (err) {
    consoleMessage({
      message: "An error while sending SMS after buyer starts a negotiation",
      type: "error",
      error: err,
    });
  }
}
