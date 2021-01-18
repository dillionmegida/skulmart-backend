import { CLOUDINARY_PRODUCT_IMAGES_FOLDER } from "constants/index";
import { FREE_PLAN, SILVER_PLAN } from "constants/subscriptionTypes";
import SellerInterface from "interfaces/Seller";
import Product from "models/Product";
import Seller from "models/Seller";
import Store from "models/Store";
import { uploadImage } from "utils/image";
import { capitalize, replaceString } from "utils/strings";

export default async function postProduct(req: any, res: any) {
  try {
    let { name, desc, category, price, quantity } = req.body;

    const loggedInSeller: SellerInterface = req.user;

    const response = await Seller.findOne({
      _id: loggedInSeller._id,
    });

    if (!response) return res.status(404).json({ message: "Seller not found" });

    const { subscription_type } = response;

    const subscriptionType =
      subscription_type === SILVER_PLAN.name
        ? { ...SILVER_PLAN }
        : { ...FREE_PLAN };

    let maxProducts = subscriptionType.max_products;

    const allProducts = await Product.find({
      store: loggedInSeller.store,
      seller: loggedInSeller._id,
    });

    if (allProducts.length === maxProducts)
      return res.status(400).json({
        message: `The plan you subscribed for (${subscriptionType.name} plan) only supports maximum of ${maxProducts} products.
          You can delete one product to give room for another.`,
      });

    name = capitalize(name.trim());
    category = category.toLowerCase().trim();
    desc = desc.trim();
    quantity = parseInt(quantity);

    // Check if the same name has been posted by the same seller
    const existingProduct = await Product.findOne({
      name,
      seller: loggedInSeller._id,
    });

    if (existingProduct) {
      return res.status(400).json({
        message: `You have a similar product with name '${name}' before`,
      });
    }

    const store = await Store.findOne({
      _id: loggedInSeller.store,
    });

    if (store === null) {
      // then the store does not exist
      // this may never happen though, because if there is no store, server.js will redirectoy to homepage
      return res.status(400).json({
        error: "Store unavailable",
        message: "Error creating product. Please try again",
      });
    }

    const imageDetails = await uploadImage({
      path: req.file.path,
      filename: replaceString({
        str: name,
        replace: " ",
        _with: "-",
      }).toLowerCase(),
      folder: CLOUDINARY_PRODUCT_IMAGES_FOLDER,
    });

    if (!imageDetails.success)
      return res.status(400).json({
        error: "Upload failed. Please try again",
      });

    const { public_id, url } = imageDetails;

    const newProduct = new Product({
      img: { public_id, url },
      name,
      desc,
      category,
      price,
      store: store._id,
      seller: loggedInSeller._id,
      visible: true,
      quantity,
    });

    await newProduct.save();

    res.json({
      message: "Product uploaded successfully",
    });
  } catch (err) {
    console.log("An error occured during product upload >> ", err);
    res.status(500).json({
      error: err,
      message: "Product could not be added. Please try again",
    });
  }
}
