import Cart from "models/Cart";
import Negotation from "models/Negotation";
import { consoleMessage } from "utils/logs";

export default async function updateNegotiationPrice(req: any, res: any) {
  const { id } = req.params;
  const { price: _price } = req.body as { price: string };
  const price = parseInt(_price, 10);
  try {
    const negotiation = await Negotation.findById(id);

    if (!negotiation)
      return res.status(404).json({ message: "Negotiation does not exist" });

    const cart = await Cart.findOne({
      buyer: negotiation.buyer,
      product: negotiation.product,
    });

    if (cart)
      return res.status(400).json({
        message:
          "This item is in the buyer's cart, hence, cannot be renegotiated",
      });

    await Negotation.findByIdAndUpdate(negotiation._id, {
      $set: {
        negotiated_price: price,
        status: "OPENED",
      },
    });

    res.json({ message: "Negotiation price updated successfully" });
  } catch (err) {
    consoleMessage({
      message: "Could you update negotiation price",
      type: "error",
      error: err,
    });
    res.status(500).json({ message: "An error occured. Please try again" });
  }
}
