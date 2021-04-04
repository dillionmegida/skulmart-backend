import BuyerInterface from "interfaces/Buyer";
import Negotiation from "models/Negotiation";
import Product from "models/Product";
import Seller from "models/Seller";
import { consoleMessage } from "utils/logs";

export default async function startNegotiation(req: any, res: any) {
  const buyer = req.user as BuyerInterface;

  const { product_id } = req.params;

  try {

    
    const product = await Product.findOne({ _id: product_id });

    if (!product)
      return res.status(404).json({ message: "This product does not exist." });

    if (!product.is_negotiable)
      return res
        .status(400)
        .json({ message: "This product is not negotiable" });

    const seller = await Seller.findOne({ _id: product.seller });

    if (!seller)
      return res
        .status(404)
        .json({ message: "The seller for this product does not exist" });

    const existingNegotiation = await Negotiation.findOne({
      product: product_id,
      status: { $ne: "CLOSED" },
    });

    if (existingNegotiation)
      return res
        .status(400)
        .json({ message: "You have an open negotiation for this product" });

    const newNegotiation = new Negotiation({
      buyer,
      seller,
      product,
      status: "AWAITING SELLER",
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
