import Negotation from "models/Negotation";
import {
  buyerPopulate,
  productPopulate,
  sellerPopulate,
} from "utils/documentPopulate";

export default async function getNegotiation(req: any, res: any) {
  const { id } = req.params;
  try {
    const negotiation = await Negotation.findById(id)
      .populate(buyerPopulate({ remove: ["banks", "cards"] }))
      .populate(sellerPopulate({ remove: ["wallet", "cards", "banks"] }))
      .populate(productPopulate({}));

    if (!negotiation)
      return res.status(404).json({ message: "Negotiation does not exist" });

    res.json({ negotiation });
  } catch {
    res.status(500).json({ message: "An error occured. Please try again" });
  }
}
