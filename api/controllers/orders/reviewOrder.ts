import chalk from "chalk";
import BuyerInterface from "interfaces/Buyer";
import SellerInterface from "interfaces/Seller";
import buyerReviewedOrder from "mails/buyerReviewedOrder";
import Order from "models/Order";
import Product from "models/Product";
import ProductReview from "models/ProductReview";
import Seller from "models/Seller";

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

    const product = await Product.findOne({ _id: order.product });
    if (product) {
      await Product.findByIdAndUpdate(product._id, {
        $set: {
          ratings: product.ratings.concat(rating),
        },
      });
      // it's not necessary sending a bad request if the product does not exist
      // because
      // the seller may have deleted it, and that should not cause
      // a bad experience for the buyer
    }

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
      },
    });

    res.json({ message: "Review submitted successfully" });

    await buyerReviewedOrder({
      seller: seller as SellerInterface,
      rating,
      review,
      buyer,
    });
  } catch (err) {
    console.log(chalk.red("An error occured during reviewing order >>> "), err);
    res.status(500).json({
      message: "An error occured. Please try again",
    });
  }
}
