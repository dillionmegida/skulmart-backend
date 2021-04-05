import chalk from "chalk";
import { CLOUDINARY_USER_IMAGES_FOLDER } from "constants/index";
import SellerInterface from "interfaces/Seller";
import Seller from "models/Seller";
import shortid from "shortid";
import { uploadImage } from "utils/image";
import { capitalize, replaceString } from "utils/strings";
import { allParametersExist } from "utils/validateBodyParameters";

export default async function onboarding1(req: any, res: any) {
  const user = req.user as SellerInterface;

  try {
    allParametersExist(req.body, "brand_name", "brand_desc", "brand_category");

    const body: SellerInterface = { ...req.body };

    const { brand_name: _brand_name, brand_desc, brand_category } = body;

    const brand_name = capitalize(_brand_name.trim());
    const username =
      replaceString({
        str: brand_name,
        replace: " ",
        _with: "-",
      }).toLowerCase() + shortid.generate();

    const uploadImageResult = await uploadImage({
      path: req.file.path,
      filename: username,
      folder: CLOUDINARY_USER_IMAGES_FOLDER,
    });

    if (!uploadImageResult.success)
      return res.status(400).json({
        message: "Error occured. Please try again",
      });

    const { public_id, url } = uploadImageResult;

    await Seller.findByIdAndUpdate(user._id, {
      $set: {
        img: {
          public_id,
          url,
        },
        username,
        brand_name,
        brand_desc,
        brand_category,
      },
    });

    res.json({
      message: "Business Information submitted successfully ✔",
    });
  } catch (err) {
    console.log(
      chalk.red("Error occuring during onboarding seller, stage 1 >> "),
      err
    );
    res.status(500).json({ message: "An error occured. Please try again" });
  }
}
