import chalk from "chalk";
import BuyerInterface from "interfaces/Buyer";
import SellerInterface from "interfaces/Seller";
import buyerReviewedOrder from "mails/buyerReviewedOrder";
import Order from "models/Order";
import ProductReview from "models/ProductReview";
import Seller from "models/Seller";
import { saveActivity } from "utils/activities";
import { allParametersExist } from "utils/validateBodyParameters";

export default async function reviewOrder(req: any, res: any) {
  const buyer = req.user as BuyerInterface;
  const { id } = req.params;

  try {
    allParametersExist(req.body, "rating", "review");

    const { rating, review } = req.body as {
      rating: number;
      review: string;
    };

    const order = await Order.findOne({ _id: id });
    if (!order) return res.status(400).json({ message: "Order not found" });

    if (order.has_buyer_reviewed_order)
      return res
        .status(400)
        .json({ message: "You have reviewed this order already" });

    const seller = await Seller.findOne({ _id: order.seller });

    if (seller === null) {
      // we shouldn't stop the buyer from still reviewing
    }

    const newProductReview = new ProductReview({
      rating,
      review,
      buyer: buyer._id,
      product: order.product,
      order: order._id,
    });

    await newProductReview.save();

    await Order.findByIdAndUpdate(order._id, {
      $set: {
        has_buyer_reviewed_order: true,
        review: newProductReview._id,
      },
    });

    res.json({ message: "Review submitted successfully" });

    await buyerReviewedOrder({
      seller: seller as SellerInterface,
      rating,
      review,
      buyer,
    });

    await saveActivity({
      type: "ORDER_REVIEWED",
      options: {
        order_id: order._id,
        buyer_id: order.buyer,
        seller_id: order.seller,
      },
    });
  } catch (err) {
    console.log(chalk.red("An error occured during reviewing order >>> "), err);
    res.status(500).json({
      message: "An error occured. Please try again",
    });
  }
}
