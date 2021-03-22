import sendTextMessage from "api/helpers/sendTextMessage";
import { consoleMessage } from "utils/logs";
import { getAcceptablePhoneNo } from "utils/phoneNo";

type Args = {
  seller: {
    phone: string;
  };
  type: "success" | "error";
};

export default async function smsAfterAdminReviewsDocument({
  seller: { phone },
  type,
}: Args) {
  const sellerPhone = getAcceptablePhoneNo(phone);

  if (type === "error") return; // for now, don't send messages if there's an error

  const message =
    "Congratulations 🎉. Your document has been verified successfully. ";

  try {
    await sendTextMessage({ recipient_num: sellerPhone, message });
  } catch (err) {
    consoleMessage({
      message:
        "An error occured while sending seller SMS after their document was reviewed",
      error: err,
      type: "error",
    });
  }
}
