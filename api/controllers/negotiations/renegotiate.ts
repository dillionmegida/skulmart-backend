import Cart from "models/Cart";
import Negotation from "models/Negotiation";
import { consoleMessage } from "utils/logs";

export default async function renegotiate(req: any, res: any) {
  const { id } = req.params;

  try {
    const negotiation = await Negotation.findById(id);

    if (!negotiation)
      return res
        .status(404)
        .json({ message: "This negotiation record does not exist" });

    const cart = await Cart.findOne({
      buyer: negotiation.buyer,
      product: negotiation.product,
    });

    if (cart)
      return res.status(400).json({
        message: "You cannot renegotiate a product in your cart",
      });

    await Negotation.findByIdAndUpdate(negotiation._id, {
      $set: {
        status: "AWAITING SELLER",
      },
    });

    res.json({
      message: "Negotiation has been re-opened successfully",
    });
  } catch (err) {
    consoleMessage({
      message: "An error occured during renegotiation",
      error: err,
      type: "error",
    });
    res
      .status(500)
      .json({ message: "An error occured. Please try again later." });
  }
}
