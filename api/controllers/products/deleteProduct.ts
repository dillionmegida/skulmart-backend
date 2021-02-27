import ProductInterface from "interfaces/Product";
import Product from "models/Product";
import ProductReview from "models/ProductReview";
import { deleteImage } from "utils/image";

export default async function deleteProduct(req: any, res: any) {
  try {
    const product = await Product.findById(req.params.id);

    if (!product)
      return res.status(404).json({
        message: "Error occured while deleting product. Please try again.",
      });

    await Product.findByIdAndDelete(product._id);

    await deleteImage({
      public_id: product.img.public_id as string,
      errorMsg: "Could not delete product image",
    });

    res.json({
      message: "Product deleted successfully",
    });

    await ProductReview.findOneAndDelete({ product: product._id });
  } catch (err) {
    console.log("An error occured during product delete >> ", err);
    res.status(500).json({
      error: err,
      message: "No product with that id",
    });
  }
}
