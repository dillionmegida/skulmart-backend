import chalk from "chalk";
import { CLOUDINARY_PRODUCT_IMAGES_FOLDER } from "constants/index";
import SellerInterface from "interfaces/Seller";
import ProductInterface from "interfaces/Product";
import Order from "models/Order";
import Product from "models/Product";
import Store from "models/Store";
import { deleteImage, uploadImage } from "utils/image";
import { capitalize, replaceString } from "utils/strings";
import { allParametersExist } from "utils/validateBodyParameters";

export default async function updateProduct(req: any, res: any) {
  try {
    allParametersExist(
      req.body,
      "name",
      "desc",
      "category",
      "price",
      "delivery_fee",
      "img_public_id",
      "img_url",
      "quantity",
      "is_negotiable"
    );

    const {
      name: _name,
      desc: _desc,
      category: _category,
      price: _price,
      delivery_fee: _delivery_fee,
      img_public_id,
      img_url,
      quantity: _quantity,
      is_negotiable: _is_negotiable,
    } = req.body as {
      name: string;
      desc: string;
      category: string;
      price: string;
      img_public_id: string;
      img_url: string;
      delivery_fee: string;
      quantity: string;
      is_negotiable: string;
    };

    const name = capitalize(_name.trim());
    const category = _category.toLowerCase().trim();
    const desc = _desc.trim();
    const quantity = parseInt(_quantity, 10);
    const price = parseInt(_price, 10);
    const delivery_fee = isNaN(parseInt(_delivery_fee, 10))
      ? 0
      : parseInt(_delivery_fee, 10);
    const is_negotiable = _is_negotiable === "true";

    const authUser = req.user as SellerInterface;

    const existingProduct = await Product.findOne({
      name,
      seller: authUser._id,
    });

    if (existingProduct && existingProduct._id.toString() !== req.params.id) {
      // then there is an existing product with the name
      return res.status(400).json({
        message: `Product with the name '${name}' already exists`,
      });
    }

    const store = await Store.findOne({ _id: authUser.store });

    if (store === null) {
      // then the store does not exist
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

      const orders = await Order.find({
        product: (existingProduct as ProductInterface)._id,
      });

      if (orders.length > 0)
        return res.status(400).json({
          message:
            // to help avoid changing to a different image after some buyers have bought a product
            // and probably added a review to it
            "You cannot change the image of a product that buyers have bought",
        });

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

      if (!result.success)
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
        delivery_fee,
        is_negotiable,
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
