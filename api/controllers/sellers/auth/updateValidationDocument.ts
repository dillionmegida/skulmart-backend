import chalk from "chalk";
import { CLOUDINARY_USER_VERIFICATION_DOCUMENTS_FOLDER } from "constants/index";
import SellerInterface from "interfaces/Seller";
import newVerificationDocument from "mails/newVerificationDocument";
import Seller from "models/Seller";
import ValidationDocument from "models/ValidationDocument";
import { deleteImage, uploadImage } from "utils/image";
import { replaceString } from "utils/strings";

export default async function updateValidationDocument(req: any, res: any) {
  const seller = req.user as SellerInterface;

  try {
    const submittedValidationDocument = await ValidationDocument.findOne({
      seller: seller._id,
    });

    if (!submittedValidationDocument)
      return res.status(400).json({
        message:
          "Sorry we couldn't find your previously submitted document. Kindly contact us.",
      });

    console.log({ ...submittedValidationDocument.img });

    await deleteImage({
      public_id: submittedValidationDocument.img.public_id as string,
      errorMsg: "Could not delete submitted validation document",
    });

    const uploadImageResult = await uploadImage({
      path: req.file.path,
      filename: replaceString({
        str: seller.fullname + " verification-document",
        replace: " ",
        _with: "-",
      }),
      folder: CLOUDINARY_USER_VERIFICATION_DOCUMENTS_FOLDER,
    });

    if (!uploadImageResult.success)
      return res.status(400).json({
        message: "An error occured. Please try again",
      });

    const { public_id, url } = uploadImageResult;

    await ValidationDocument.findByIdAndUpdate(
      submittedValidationDocument._id,
      {
        $set: {
          img: {
            public_id,
            url,
          },
        },
      }
    );

    await Seller.findByIdAndUpdate(submittedValidationDocument.seller, {
      $set: {
        verified: "AWAITING_REVIEW",
      },
    });

    await newVerificationDocument();

    res.json({
      message: "Submitted Successfully.",
    });
  } catch (err) {
    console.log(chalk.red("Error updating validation document >> "), err);
    res.status(500).json({ message: "An error occured. Please try again" });
  }
}
