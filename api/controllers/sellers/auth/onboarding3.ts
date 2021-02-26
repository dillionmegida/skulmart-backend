import chalk from "chalk";
import { CLOUDINARY_USER_VERIFICATION_DOCUMENTS_FOLDER } from "constants/index";
import SellerInterface from "interfaces/Seller";
import Seller from "models/Seller";
import VerifiedSeller from "models/VerifiedSeller";
import { uploadImage } from "utils/image";
import { replaceString } from "utils/strings";

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

    const newSellerToBeVerified = new VerifiedSeller();
    newSellerToBeVerified.seller = user._id;
    newSellerToBeVerified.img = {
      public_id,
      url,
    };
    await newSellerToBeVerified.save();

    await Seller.findByIdAndUpdate(user._id, {
      $set: {
        verified: "AWAITING_REVIEW",
      },
    });

    res.json({
      message:
        "Submitted Successfully. You'll get an email in less than 48hrs about your verification status.",
    });
  } catch (err) {
    console.log(
      chalk.red("Error occuring during onboarding seller, stage 1 >> "),
      err
    );
    res.status(500).json({ message: "An error occured. Please try again" });
  }
}
