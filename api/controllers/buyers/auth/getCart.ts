import chalk from "chalk";
import BuyerInterface from "interfaces/Buyer";
import Cart from "models/Cart";
import { productPopulate } from "utils/documentPopulate";

export default async function getCart(req: any, res: any) {
  try {
    const buyer = req.user as BuyerInterface;
    const carts = await Cart.find({ buyer: buyer._id }).populate({
      ...productPopulate({}),
    });
    res.json({ carts });
  } catch (err) {
    console.log(chalk.red("Could not fetch cart because >>> "), err);
  }
}
