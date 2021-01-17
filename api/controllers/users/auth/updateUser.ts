import chalk from "chalk";
import { CLOUDINARY_USER_IMAGES_FOLDER } from "constants/index";
import BuyerInterface from "interfaces/Buyer";
import SellerInterface from "interfaces/Seller";
import Buyer from "models/Buyer";
import Seller from "models/Seller";
import Store from "models/Store";
import { deleteImage, uploadImage } from "utils/image";
import { capitalize, replaceString } from "utils/strings";

export default async function updateUser(req: any, res: any) {
  const body = { ...req.body } as
    | (BuyerInterface & {
        img_public_id: string;
        img_url: string;
      })
    | (SellerInterface & {
        img_public_id: string;
        img_url: string;
      });

  const authUser = req.user as SellerInterface | BuyerInterface;

  try {
    const store = await Store.findOne({
      _id: authUser.store,
    });

    if (!store)
      return res.status(400).json({
        message: "Store does not exist",
      });

    // former image details
    let public_id = body.img_public_id as any;
    let url = body.img_url as any;

    if (req.file !== undefined) {
      // then a new image was selected

      // delete the previous image stored
      await deleteImage({
        public_id,
        errorMsg: "Previous image could not be deleted",
      });

      const result = await uploadImage({
        path: req.file.path,
        filename: replaceString({
          str: body.fullname,
          replace: " ",
          _with: "-",
        }).toLowerCase(),
        folder: CLOUDINARY_USER_IMAGES_FOLDER,
      });

      if (result.error)
        return res.status(400).json({
          error: "Upload failed. Please try again",
        });

      // change image details to the new image
      public_id = result.public_id;
      url = result.url;
    }

    if (body.user_type === "seller") {
      let {
        fullname,
        brand_name,
        username,
        brand_desc,
        whatsapp,
        instagram = "",
        twitter = "",
      } = body;

      const existingUser = await Seller.findOne({
        username,
        _id: authUser._id,
      });

      if (
        existingUser &&
        existingUser._id.toString() !== authUser._id.toString()
      ) {
        // then there is a seller with the name
        return res.status(400).json({
          message: `Seller with the username '${username}' already exists`,
        });
      }

      fullname = capitalize(fullname.trim());
      brand_name = capitalize(brand_name.trim());
      // remove spaces - though this is handled in the client side already but just incase
      username = username.trim().replace(/\s/g, "").toLowerCase();

      await Seller.findByIdAndUpdate(authUser._id, {
        $set: {
          img: {
            public_id,
            url,
          },
          fullname,
          brand_name,
          username,
          brand_desc,
          whatsapp,
          instagram,
          twitter,
        },
      });
    } else if (body.user_type === "buyer") {
      let { fullname, phone } = body;

      fullname = capitalize(fullname.trim());

      await Buyer.findByIdAndUpdate(req.user._id, {
        $set: {
          img: {
            public_id,
            url,
          },
          fullname,
          phone,
        },
      });
    }
    return res.json({
      message: "Updated account successfully",
    });
  } catch (err) {
    console.log(chalk.red("Error updating user info >> ", err));
    res.status(400).json({
      error: err,
      message: "Error occured. Please try again",
    });
  }
}
