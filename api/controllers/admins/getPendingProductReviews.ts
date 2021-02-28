import chalk from "chalk";
import ProductReview from "models/ProductReview";
import { buyerPopulate, productPopulate } from "utils/documentPopulate";

export default async function getPendingProductReviews(req: any, res: any) {
  try {
    const productReviews = await ProductReview.find({
      status: "AWAITING_REVIEW",
    })
      .populate({
        ...buyerPopulate,
      })
      .populate({
        ...productPopulate,
      });
    res.json({ productReviews });
  } catch (err) {
    console.log(chalk.red("Error getting product revies >>> "), err);
    res.status(500).json({
      message: "Error occured. Please try again",
    });
  }
}
