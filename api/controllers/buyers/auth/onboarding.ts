import chalk from "chalk";
import { CLOUDINARY_USER_IMAGES_FOLDER } from "constants/index";
import { addEngageBuyer, updateEngageBuyer } from "helpers/engage-so";
import BuyerInterface from "interfaces/Buyer";
import Buyer from "models/Buyer";
import { uploadImage } from "utils/image";
import { capitalize, replaceString } from "utils/strings";
import { allParametersExist } from "utils/validateBodyParameters";

export default async function onboarding(req: any, res: any) {
  const user = req.user as BuyerInterface;

  try {
    allParametersExist(req.body, "fullname", "phone");

    const body: BuyerInterface = { ...req.body };

    const { fullname: _fullname, phone } = body;

    const fullname = capitalize(_fullname.trim());
    const imageInfo: { public_id: string | null; url: string | null } = {
      public_id: null,
      url: null,
    };

    if (req.file !== undefined) {
      const uploadImageResult = await uploadImage({
        path: req.file.path,
        filename: replaceString({
          str: fullname,
          replace: " ",
          _with: "-",
        }).toLowerCase(),
        folder: CLOUDINARY_USER_IMAGES_FOLDER,
      });

      if (!uploadImageResult.success)
        return res.status(400).json({
          message: "Error occured. Please try again",
        });

      imageInfo.public_id = uploadImageResult.public_id;
      imageInfo.url = uploadImageResult.url;
    }

    const updatedBuyer = await Buyer.findByIdAndUpdate(user._id, {
      $set: {
        fullname,
        phone,
        img: {
          public_id: imageInfo.public_id,
          url: imageInfo.url,
        },
      },
    });

    updateEngageBuyer(updatedBuyer as BuyerInterface);

    res.json({
      message: "Profile updated successfully ✔",
    });
  } catch (err) {
    console.log(
      chalk.red("Error occuring during onboarding seller, stage 1 >> "),
      err
    );
    res.status(500).json({ message: "An error occured. Please try again" });
  }
}
