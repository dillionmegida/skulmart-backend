import express, { Request } from "express";
import Product from "models/Product";
const router = express.Router();
import isAuthenticated from "middlewares/isAuthenticated";
import Cart from "models/Cart";
import BuyerInterface from "interfaces/Buyer";
import chalk from "chalk";
import Buyer from "models/Buyer";
import mongoose from "mongoose";
import Seller from "models/Seller";

/*
 *
 * PUBLIC ROUTES
 *
 */

router.get("/", async (req, res) => {
  res.json({ buyers: [] });
});

/*
 *
 * PRIVATE ROUTES
 *
 */

// get cart content
router.get("/cart", isAuthenticated, async (req: any, res) => {
  try {
    const buyer = req.user as BuyerInterface;
    const carts = await Cart.find({ buyer: buyer._id }).populate("product");
    res.json({ carts });
  } catch (err) {
    console.log(chalk.red("Could not fetch cart because >>> "), err);
  }
});

// add item to cart
router.post("/cart/:product_id", isAuthenticated, async (req: any, res) => {
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

    const _buyer = await Buyer.findById(buyer._id);

    // impossible to have this error, but let it be here
    if (!_buyer)
      return res.status(400).json({ message: "Buyer account not found" });

    await newCart.save();

    await Buyer.findByIdAndUpdate(buyer._id, {
      $set: {
        cart: _buyer.cart.concat(newCart._id),
      },
    });

    res.json({ message: "Product successfully added to cart" });
  } catch (err) {
    console.log(chalk.red("Could not add product to cart because >>> "), err);
  }
});

// remove item from cart
router.delete("/cart/:product_id", isAuthenticated, async (req: any, res) => {
  const { product_id } = req.params;

  const productId = mongoose.Types.ObjectId(product_id);

  try {
    const buyer = req.user as BuyerInterface;

    const criteria = {
      buyer: buyer._id,
      product: productId,
    };

    const product = await Product.findById(productId);

    if (!product)
      return res.status(400).json({
        message: "Product does not exist",
      });

    const cart = await Cart.findOne({ ...criteria });

    if (!cart)
      return res.status(400).json({
        message: "Cart not found",
      });

    // delete cart document
    await Cart.findOneAndDelete({ ...criteria });

    const _buyer = await Buyer.findById(buyer._id);

    // delete the id from the buyer cart
    // the id allows .populate when getting the buyer
    if (_buyer) {
      const cartId = _buyer.cart.findIndex(
        (a) => a.toString() === cart._id.toString()
      );

      if (cartId !== 1) {
        const newSetOfIds = _buyer.cart.splice(cartId, 1);

        console.log({ newSetOfIds });

        await Buyer.findByIdAndUpdate(buyer._id, {
          $set: {
            cart: newSetOfIds,
          },
        });
      }
    }

    res.json({
      message: "Item removed successfully from cart",
    });
  } catch (err) {
    console.log(
      chalk.red("Could not remove product from cart because >>> "),
      err
    );
  }
});

export default router;
