import BuyerInterface from "interfaces/Buyer";
import Negotation from "models/Negotation";
import Product from "models/Product";
import Seller from "models/Seller";
import { consoleMessage } from "utils/logs";

export default async function startNegotation(req: any, res: any) {
  const buyer = req.user as BuyerInterface;

  const { product_id } = req.params;

  try {
    const product = await Product.findOne({ _id: product_id });

    if (!product)
      return res.status(404).json({ message: "This product does not exist." });

    const seller = await Seller.findOne({ _id: product.seller });

    if (!seller)
      return res
        .status(404)
        .json({ message: "The seller for this product does not exist" });

    const newNegotiation = new Negotation({
      buyer,
      seller,
      product,
      status: "OPENED",
    });

    await newNegotiation.save();

    res.json({
      message: "Negotation has been started.",
      negotation_id: newNegotiation._id,
    });
  } catch (err) {
    consoleMessage({
      message: "An error occured during negotation start",
      error: err,
      type: "error",
    });
    res
      .status(500)
      .json({ message: "An error occured. Please try again later." });
  }
}
