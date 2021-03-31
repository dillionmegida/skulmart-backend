import BuyerInterface from "interfaces/Buyer";
import Negotation from "models/Negotiation";
import {
  buyerPopulate,
  productPopulate,
  sellerPopulate,
} from "utils/documentPopulate";

export default async function getNegotiationsOfBuyer(req: any, res: any) {
  const buyer = req.user as BuyerInterface;

  try {
    const negotiations = await Negotation.find({ buyer: buyer._id })
      .populate(buyerPopulate({ remove: ["banks", "cards"] }))
      .populate(sellerPopulate({ remove: ["wallet", "cards", "banks"] }))
      .populate(productPopulate({}));

    res.json({ negotiations });
  } catch {
    res.status(500).json({ message: "An error occured. Please try again" });
  }
}
