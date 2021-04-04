import chalk from "chalk";
import Cart from "models/Cart";
import mongoose from "mongoose";
import { allParametersExist } from "utils/validateBodyParameters";

export default async function updateItemInCart(req: any, res: any) {
  const { cart_id } = req.params;

  try {
    allParametersExist(req.body, "quantity", "buyer_desc");

    const { quantity, buyer_desc = "" } = req.body as {
      quantity: number;
      buyer_desc: string;
    };

    const cartId = mongoose.Types.ObjectId(cart_id);

    const cartItem = await Cart.findOne({ _id: cartId });

    if (!cartItem)
      return res.status(400).json({
        message: "Item is not in cart",
      });

    await Cart.findByIdAndUpdate(cart_id, {
      $set: {
        quantity,
        buyer_desc,
      },
    });

    res.json({});
  } catch (err) {
    console.log(chalk.red("Could not update item in cart because >>> "), err);
  }
}
