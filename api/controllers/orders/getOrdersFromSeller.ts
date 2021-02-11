import chalk from "chalk";
import { ORDERS_PER_PAGE } from "constants/index";
import SellerInterface from "interfaces/Seller";
import Order from "models/Order";

export default async function getOrders(req: any, res: any) {
  const seller = req.user as SellerInterface;
  const { page: _page = 0 } = req.query;
  const page = parseInt(_page);

  const criteria = {
    seller: seller._id,
  };

  try {
    const totalCount = await Order.countDocuments({ ...criteria });

    const allSellerOrders = await Order.find({ ...criteria })
      .limit(ORDERS_PER_PAGE)
      .skip(page * ORDERS_PER_PAGE)
      .populate({ path: "product", select: "-views_devices" })
      .populate("buyer")
      .populate("review");

    const totalPages = Math.ceil(totalCount / ORDERS_PER_PAGE) - 1; // since pages start from 0;

    res.json({ orders: allSellerOrders.reverse(), totalPages });
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
