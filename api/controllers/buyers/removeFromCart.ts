import chalk from "chalk";
import BuyerInterface from "interfaces/Buyer";
import Buyer from "models/Buyer";
import Cart from "models/Cart";
import Product from "models/Product";
import mongoose from "mongoose";

export default async function removeFromCart(req: any, res: any) {
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
}
