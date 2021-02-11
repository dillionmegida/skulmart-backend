import chalk from "chalk";
import { REVIEWS_PER_PAGE } from "constants/index";
import Product from "models/Product";
import ProductReview from "models/ProductReview";
import { sliceAndReverse } from "utils/arrays";

export default async function getProductReviews(req: any, res: any) {
  const { id } = req.params;
  const { page: _page = 0 } = req.query;
  const page = parseInt(_page);
  try {
    const product = await Product.findOne({ _id: id })
      .populate({ path: "seller", select: "-views_devices" })
      .select("-views_devices");

    if (!product)
      return res.status(400).json({
        message: "Product not found",
      });

    const reviewsCriteria = { product: id };

    const totalCount = await ProductReview.countDocuments({
      ...reviewsCriteria,
    });

    const reviews = await ProductReview.find({ ...reviewsCriteria }).populate(
      "buyer"
    );

    const modifiedReviews = sliceAndReverse({
      arr: reviews,
      limit: REVIEWS_PER_PAGE,
      currentPage: page,
    });

    const totalPages = Math.ceil(totalCount / REVIEWS_PER_PAGE) - 1;

    res.json({ product, reviews: modifiedReviews, totalPages });
  } catch (err) {
    console.log(chalk.red("Product reviews could not be retrived >> "), err);
    return res
      .status(400)
      .json({ message: "Problem occured. Please try again" });
  }
}
