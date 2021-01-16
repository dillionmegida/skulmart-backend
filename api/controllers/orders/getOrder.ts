import Order from "models/Order";

export default async function getOrder(req: any, res: any) {
  const { id } = req.params;

  try {
    const order = await Order.findById(id)
      .populate("product")
      .populate("review");
    res.json({
      order,
    });
  } catch (err) {
    res.status(400).json({
      message: "Order not found",
    });
  }
}
