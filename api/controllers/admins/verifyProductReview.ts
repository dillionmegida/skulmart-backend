import chalk from "chalk";
import Product from "models/Product";
import ProductReview from "models/ProductReview";

export default async function verifyProductReview(req: any, res: any) {
  const { id } = req.params;
  const { type } = req.body as {
    type: "accept" | "decline";
  };
  try {
    const productReview = await ProductReview.findById(id);
    if (!productReview)
      return res.status(400).json({ message: "This review does not exist" });

    if (type === "accept") {
      const product = await Product.findOne({ _id: productReview.product });
      if (product) {
        await Product.findByIdAndUpdate(product._id, {
          $set: {
            ratings: product.ratings.concat({
              buyer_id: productReview.buyer,
              rating: productReview.rating,
            }),
          },
        });
      }

      await ProductReview.findByIdAndUpdate(id, {
        $set: {
          status: "ACCEPTED",
        },
      });
    } else {
      await ProductReview.findOneAndUpdate(id, {
        $set: {
          status: "DECLINED",
        },
      });
    }

    res.json({
      message: `Product review ${type === "accept" ? "accepted" : "declined"}`,
    });
  } catch (err) {
    console.log(chalk.red("Error verifying product review >>> "), err);
    res.status(500).json({ message: "Error occured. Please try again" });
  }
}
