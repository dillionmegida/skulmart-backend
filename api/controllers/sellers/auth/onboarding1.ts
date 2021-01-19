import chalk from "chalk";
import { CLOUDINARY_USER_IMAGES_FOLDER } from "constants/index";
import SellerInterface from "interfaces/Seller";
import Seller from "models/Seller";
import { uploadImage } from "utils/image";
import { capitalize } from "utils/strings";

export default async function onboarding1(req: any, res: any) {
  const user = req.user as SellerInterface;

  const body: SellerInterface = { ...req.body };

  const {
    fullname: _fullname,
    brand_name: _brand_name,
    username: _username,
    brand_desc,
  } = body;

  const brand_name = capitalize(_brand_name.trim());
  const fullname = capitalize(_fullname.trim());
  const username = _username.trim().replace(/\s/g, "").toLowerCase();

  try {
    const sellerWithSameUsername = await Seller.findOne({
      username: username,
    });

    //   check if user already exists by username
    if (sellerWithSameUsername)
      // return if user exists
      return res.status(400).json({
        message: `Seller with username '${body.username}' already exists.`,
      });

    const uploadImageResult = await uploadImage({
      path: req.file.path,
      filename: username.toLowerCase(),
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
        fullname,
        username,
        brand_name,
        brand_desc,
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
