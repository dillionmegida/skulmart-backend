import express, { Request } from "express";
import Product from "models/Product";
const router = express.Router();
import isAuthenticated from "middlewares/isAuthenticated";
import Cart from "models/Cart";
import BuyerInterface from "interfaces/Buyer";
import chalk from "chalk";
import Buyer from "models/Buyer";

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

router.get("/cart", isAuthenticated, async (req: any, res) => {
  try {
    const buyer = req.user as BuyerInterface;
    const carts = await Cart.find({ buyer: buyer._id }).populate("product");
    res.json({ carts });
  } catch (err) {
    console.log(chalk.red("Could not fetch cart because >>> "), err);
  }
});

router.post("/cart/:product_id", isAuthenticated, async (req: any, res) => {
  const { product_id } = req.params;

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

    const { quantity = 1 } = req.body as { quantity: number };

    const product = await Product.findOne({ _id: product_id });

    if (!product)
      return res.status(400).json({
        message: "Product not found",
      });

    const newCart = new Cart({
      buyer: buyer._id,
      product: product_id,
      quantity,
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

export default router;
