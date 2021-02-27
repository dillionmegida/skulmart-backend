import chalk from "chalk";
import BuyerInterface from "interfaces/Buyer";
import Product from "models/Product";
import SavedProduct from "models/SavedProduct";

export default async function saveProduct(req: any, res: any) {
  const buyer = req.user as BuyerInterface;
  const { id } = req.params;

  try {
    const product = await Product.findById(id);
    if (!product)
      return res.status(400).json({
        message: "Product does not exist",
      });

    const savedProduct = new SavedProduct({
      buyer: buyer._id,
      product: product._id,
    });
    await savedProduct.save();

    res.json({ message: "Product saved successfully" });
  } catch (err) {
    console.log(chalk.red("Could not save product >>> "), err);
    res.status(500).json({ message: "Error occured. Please try again" });
  }
}
