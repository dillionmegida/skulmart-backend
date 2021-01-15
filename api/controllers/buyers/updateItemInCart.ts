import chalk from "chalk";
import BuyerInterface from "interfaces/Buyer";
import Cart from "models/Cart";
import mongoose from "mongoose";

export default async function updateItemInCart(req: any, res: any) {
  const { cart_id } = req.params;

  const { quantity } = req.body as { quantity: number };

  const cartId = mongoose.Types.ObjectId(cart_id);

  try {
    const cartItem = await Cart.findOne({ _id: cartId });

    if (!cartItem)
      return res.status(400).json({
        message: "Item is not in cart",
      });

    await Cart.findByIdAndUpdate(cart_id, {
      $set: {
        quantity,
      },
    });

    res.json({});
  } catch (err) {
    console.log(chalk.red("Could not update item in cart because >>> "), err);
  }
}
