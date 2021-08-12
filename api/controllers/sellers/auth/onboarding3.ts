import chalk from "chalk";
import { CLOUDINARY_USER_VERIFICATION_DOCUMENTS_FOLDER } from "constants/index";
import SellerInterface from "interfaces/Seller";
import newVerificationDocument from "mails/newVerificationDocument";
import Seller from "models/Seller";
import ValidationDocument from "models/ValidationDocument";
import { uploadImage } from "utils/image";
import { replaceString } from "utils/strings";
import { updateEngageSeller } from "helpers/engage-so";

export default async function onboarding3(req: any, res: any) {
  const user = req.user as SellerInterface;

  try {
    const uploadImageResult = await uploadImage({
      path: req.file.path,
      filename: replaceString({
        str: user.fullname + " verification-document",
        replace: " ",
        _with: "-",
      }),
      folder: CLOUDINARY_USER_VERIFICATION_DOCUMENTS_FOLDER,
    });

    if (!uploadImageResult.success)
      return res.status(400).json({
        message: "Error occured. Please try again",
      });

    const { public_id, url } = uploadImageResult;

    const newSellerToBeVerified = new ValidationDocument();
    newSellerToBeVerified.seller = user._id;
    newSellerToBeVerified.img = {
      public_id,
      url,
    };
    await newSellerToBeVerified.save();

    const updatedSeller = await Seller.findByIdAndUpdate(user._id, {
      $set: {
        verified: "AWAITING_REVIEW",
      },
    });

    if (updatedSeller) await updateEngageSeller(updatedSeller);

    await newVerificationDocument();

    res.json({
      message:
        "Submitted Successfully. You'll get an email in less than 48hrs about your verification status.",
    });
  } catch (err) {
    console.log(
      chalk.red("Error submitting validation document for review >> "),
      err
    );
    res.status(500).json({ message: "An error occured. Please try again" });
  }
}
