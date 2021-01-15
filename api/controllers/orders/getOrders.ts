import chalk from "chalk";
import BuyerInterface from "interfaces/Buyer";
import Order from "models/Order";

export default async function getOrders(req: any, res: any) {
  const buyer = req.user as BuyerInterface;

  try {
    const allBuyersOrders = await Order.find({ buyer: buyer._id }).populate(
      "product"
    );
    res.json({ orders: allBuyersOrders });
  } catch (err) {
    console.log(
      chalk.red("An error occured during getting buyer's orders >> "),
      err
    );
    res.status(400).json({
      message: "Error occured. Please try again",
    });
  }
}
