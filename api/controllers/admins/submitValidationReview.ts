import chalk from "chalk";
import sellerVerification from "mails/sellerVerification";
import Seller from "models/Seller";
import ValidationDocument from "models/ValidationDocument";
import smsAfterAdminReviewsDocument from "sms/smsAfterAdminReviewsDocument";
import { deleteImage } from "utils/image";

export default async function submitValidationReview(req: any, res: any) {
  const { id } = req.params;
  const { message, type } = req.body as {
    message: string;
    type: "success" | "error";
  };

  try {
    const validationDocument = await ValidationDocument.findById(id);
    if (!validationDocument)
      return res
        .status(404)
        .json({ message: "Validation report does not exist" });

    const seller = await Seller.findById(validationDocument.seller);
    if (!seller)
      return res.status(404).json({
        message: "Seller does not exist",
      });

    if (type === "success") {
      await Seller.findByIdAndUpdate(validationDocument.seller, {
        $set: {
          verified: "VERIFIED",
        },
      });
      // delete identification image submitted
      await deleteImage({
        public_id: validationDocument.img.public_id as string,
        errorMsg: "Could not delete seller's identification image",
      });
      // delete document
      await ValidationDocument.findByIdAndDelete(id);
      await sellerVerification({
        type: "success",
        seller,
        validationDocument: validationDocument,
      });
    } else {
      await ValidationDocument.findByIdAndUpdate(id, {
        $set: {
          status: "TO_BE_UPDATED",
          error_msg: message,
        },
      });
      await Seller.findByIdAndUpdate(validationDocument.seller, {
        $set: {
          verified: "FAILED",
        },
      });
      await sellerVerification({
        type: "error",
        seller,
        message,
        validationDocument: validationDocument,
      });
    }

    res.json({ message: "Successfully submitted review" });

    if (seller.whatsapp)
      await smsAfterAdminReviewsDocument({
        seller: { phone: seller.whatsapp },
        type,
      });
  } catch (err) {
    console.log(chalk.red("Could not validate seller's credentials >>> "), err);
    res.status(500).json({ message: "Error occured. Please try again" });
  }
}
