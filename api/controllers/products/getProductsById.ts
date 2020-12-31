import Product from "models/Product";

export default async function getProductsById(req: any, res: any) {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      visible: true,
    }).populate("seller");
    if (product === null)
      return res.status(404).json({
        error: "Invalid id",
        message: "No product with that id exists",
      });
    return res.json({ product });
  } catch (err) {
    return res.status(400).json({ message: "Product with that id not found" });
  }
}
