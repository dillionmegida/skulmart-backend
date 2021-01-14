import chalk from "chalk";
import BuyerInterface from "interfaces/Buyer";
import Order from "models/Order";
import Product from "models/Product";
import ProductReview from "models/ProductReview";

export default async function reviewOrder(req: any, res: any) {
  const buyer = req.user as BuyerInterface;
  const { id } = req.params;
  const { rating, review } = req.body as {
    rating: number;
    review: string;
  };

  try {
    const order = await Order.findOne({ _id: id });
    if (!order) return res.status(400).json({ message: "Order not found" });

    if (order.has_buyer_reviewed_order)
      return res
        .status(400)
        .json({ message: "You have reviewed this order already" });

    // it's not necessary checking if the product exists because
    // the seller may have deleted it, and that should not cause
    // a bad experience for the buyer

    // this part may not be neccessary, and may increase
    // response time, but let it be here for now
    const existingProductReview = await ProductReview.findOne({
      order: order._id,
    });
    if (existingProductReview)
      return res
        .status(400)
        .json({ message: "You have reviewed this order already" });

    const newProductReview = new ProductReview({
      rating,
      review,
      buyer: buyer._id,
      product: order.product,
    });

    await newProductReview.save();

    await Order.findByIdAndUpdate(order._id, {
      $set: {
        has_buyer_reviewed_order: true,
      },
    });

    res.json({ message: "Review submitted successfully" });
  } catch (err) {
    console.log(chalk.red("An error occured during reviewing order >>> "), err);
    res.status(500).json({
      message: "An error occured. Please try again",
    });
  }
}
