import chalk from "chalk";
import Product from "models/Product";
import ProductReview from "models/ProductReview";

export default async function getProductRatings(req: any, res: any) {
  const { id } = req.params;
  try {
    const product = await Product.findOne({ _id: id }).populate("seller");
    if (!product)
      return res.status(400).json({
        message: "Product not found",
      });

    const reviews = await ProductReview.find({ product: id });

    res.json({ product, reviews });
  } catch (err) {
    console.log(chalk.red("Product ratings could not be retrived >> "), err);
    return res
      .status(400)
      .json({ message: "Problem occured. Please try again" });
  }
}
