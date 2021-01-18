import chalk from "chalk";
import BuyerInterface from "interfaces/Buyer";
import Buyer from "models/Buyer";
import Cart from "models/Cart";
import Product from "models/Product";
import Seller from "models/Seller";
import mongoose from "mongoose";

export default async function addToCart(req: any, res: any) {
  const { product_id } = req.params;

  const { quantity = 1, seller_id } = req.body as {
    quantity: number;
    seller_id: string;
  };

  const sellerId = mongoose.Types.ObjectId(seller_id);

  try {
    const buyer = req.user as BuyerInterface;

    const buyerCart = await Cart.find({ buyer: buyer._id });

    const productAlreadyInCart =
      buyerCart.findIndex(
        ({ product }) => product.toString() === product_id
      ) !== -1;

    if (productAlreadyInCart)
      return res.status(400).json({
        message: "Product already in cart",
      });

    const product = await Product.findOne({ _id: product_id });

    if (!product)
      return res.status(400).json({
        message: "Product not found",
      });

    const seller = await Seller.findById(sellerId);

    if (!seller)
      return res.status(400).json({
        message: "Seller not found",
      });

    const newCart = new Cart({
      buyer: buyer._id,
      product: product_id,
      quantity,
      seller: seller._id,
    });

    // getting buyer again because the buyer from req.user
    // has cart populated from isAuthenticated with products
    // but only the ids are needed
    const _buyer = (await Buyer.findById(buyer._id)) as BuyerInterface;

    await Buyer.findByIdAndUpdate(buyer._id, {
      $set: {
        cart: _buyer.cart.concat(newCart._id),
      },
    });

    await newCart.save();

    res.json({ message: "Product successfully added to cart" });
  } catch (err) {
    console.log(chalk.red("Could not add product to cart because >>> "), err);
  }
}