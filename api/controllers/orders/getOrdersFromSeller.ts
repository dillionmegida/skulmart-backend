import chalk from "chalk";
import SellerInterface from "interfaces/Seller";
import Order from "models/Order";

export default async function getOrders(req: any, res: any) {
  const seller = req.user as SellerInterface;

  try {
    const allSellerOrders = await Order.find({ seller: seller._id })
      .populate("product")
      .populate("buyer")
      .populate("review");
    res.json({ orders: allSellerOrders });
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
