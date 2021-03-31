import chalk from "chalk";
import BuyerInterface from "interfaces/Buyer";
import Order from "models/Order";
import { productPopulate } from "utils/documentPopulate";

export default async function getOrdersByRef(req: any, res: any) {
  const { ref } = req.params as { ref: string };
  const buyer = req.user as BuyerInterface;

  try {
    const allBuyersOrders = await Order.find({
      buyer: buyer._id,
      ref,
    }).populate({ ...productPopulate({}) });
    res.json({ orders: allBuyersOrders });
  } catch (err) {
    console.log(
      chalk.red("An error occured during getting buyer's orders by ref >> "),
      err
    );
    res.status(400).json({
      message: "Error occured. Please try again",
    });
  }
}
