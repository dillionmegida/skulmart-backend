import Order from "models/Order";
import { buyerPopulate, productPopulate } from "utils/documentPopulate";

export default async function getOrder(req: any, res: any) {
  const { id } = req.params;

  try {
    const order = await Order.findById(id)
      .populate({ ...productPopulate({}) })
      .populate("review")
      .populate({ ...buyerPopulate({}) });
    res.json({
      order,
    });
  } catch (err) {
    res.status(400).json({
      message: "Order not found",
    });
  }
}
