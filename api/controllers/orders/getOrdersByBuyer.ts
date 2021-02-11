import chalk from "chalk";
import { ORDERS_PER_PAGE } from "constants/";
import BuyerInterface from "interfaces/Buyer";
import Order from "models/Order";
import { sliceAndReverse } from "utils/arrays";

export default async function getOrdersByBuyer(req: any, res: any) {
  const buyer = req.user as BuyerInterface;
  const { page: _page = 0 } = req.query;
  const page = parseInt(_page);

  const criteria = {
    buyer: buyer._id,
  };

  try {
    const totalCount = await Order.countDocuments({ ...criteria });

    const allBuyersOrders = await Order.find({ ...criteria }).populate(
      "product"
    );

    const modifiedOrders = sliceAndReverse({
      arr: allBuyersOrders,
      limit: ORDERS_PER_PAGE,
      currentPage: page,
    });

    const totalPages = Math.ceil(totalCount / ORDERS_PER_PAGE) - 1;

    res.json({ orders: modifiedOrders, totalPages });
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
