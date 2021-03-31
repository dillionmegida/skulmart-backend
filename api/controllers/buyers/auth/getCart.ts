import chalk from "chalk";
import BuyerInterface from "interfaces/Buyer";
import Cart from "models/Cart";
import { negotiationPopulate, productPopulate } from "utils/documentPopulate";

export default async function getCart(req: any, res: any) {
  try {
    const buyer = req.user as BuyerInterface;
    const cart = await Cart.find({ buyer: buyer._id })
      .populate({
        ...productPopulate({}),
      })
      .populate("negotiation");

    res.json({ cart });
  } catch (err) {
    console.log(chalk.red("Could not fetch cart because >>> "), err);
    res.status(500).json({ message: "Error occured. Please try again" });
  }
}
