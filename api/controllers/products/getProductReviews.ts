import chalk from "chalk";
import Product from "models/Product";
import ProductReview from "models/ProductReview";

export default async function getProductReviews(req: any, res: any) {
  const { id } = req.params;
  try {
    const product = await Product.findOne({ _id: id })
      .populate({ path: "seller", select: "-views_devices" })
      .select("-views_devices");

    if (!product)
      return res.status(400).json({
        message: "Product not found",
      });

    const reviews = await ProductReview.find({ product: id }).populate("buyer");

    res.json({ product, reviews: reviews.reverse() });
  } catch (err) {
    console.log(chalk.red("Product reviews could not be retrived >> "), err);
    return res
      .status(400)
      .json({ message: "Problem occured. Please try again" });
  }
}
