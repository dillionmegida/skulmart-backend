import chalk from "chalk";
import { CLOUDINARY_PRODUCT_IMAGES_FOLDER } from "constants/index";
import SellerInterface from "interfaces/Seller";
import Product from "models/Product";
import Store from "models/Store";
import { deleteImage, uploadImage } from "utils/image";
import { capitalize, replaceString } from "utils/strings";

export default async function updateProduct(req: any, res: any) {
  let {
    name,
    desc,
    category,
    price,
    img_public_id,
    img_url,
    quantity,
  } = req.body;

  name = capitalize(name.trim());
  category = category.toLowerCase().trim();
  desc = desc.trim();
  quantity = parseInt(quantity);

  const authUser = req.user as SellerInterface;

  try {
    const existingProduct = await Product.findOne({
      name,
      seller: authUser._id,
    });
    if (existingProduct && existingProduct._id !== req.params.id) {
      // then there is an existing product with the name
      return res.status(400).json({
        message: `Product with the name '${name}' already exists`,
      });
    }

    const store = await Store.findOne({ _id: authUser.store });

    if (store === null) {
      // then the store does not exist
      // this may never happen though, because if there is no store, server.js will redirectoy to homepage
      return res.status(400).json({
        error: "Store unavailable",
        message: "Error updating product. Please try again",
      });
    }

    // former image details
    let public_id = img_public_id;
    let url = img_url;

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
          str: name,
          replace: " ",
          _with: "-",
        }).toLowerCase(),
        folder: CLOUDINARY_PRODUCT_IMAGES_FOLDER,
      });

      if (result.error)
        return res.status(400).json({
          error: "Upload failed. Please try again",
        });

      // change image details to the new image
      public_id = result.public_id;
      url = result.url;
    }

    await Product.findByIdAndUpdate(req.params.id, {
      $set: {
        img: {
          public_id,
          url,
        },
        name,
        desc,
        category,
        price,
        store: store._id,
        seller: authUser._id,
        quantity,
      },
    });

    return res.json({
      message: `Product updated successfully`,
    });
  } catch (err) {
    console.log(chalk.red("Could not update product >> "), err);
    res.status(500).json({
      error: err,
      message: "Error occured. Please try again",
    });
  }
}