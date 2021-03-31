import SellerInterface from "interfaces/Seller";
import Negotation from "models/Negotiation";
import {
  buyerPopulate,
  productPopulate,
  sellerPopulate,
} from "utils/documentPopulate";

export default async function getNegotiationsOfSeller(req: any, res: any) {
  console.log("got here");
  const seller = req.user as SellerInterface;

  try {
    const negotiations = await Negotation.find({ seller: seller._id })
      .populate(buyerPopulate({ remove: ["banks", "cards"] }))
      .populate(sellerPopulate({ remove: ["wallet", "cards", "banks"] }))
      .populate(productPopulate({}));

    res.json({ negotiations });
  } catch {
    res.status(500).json({ message: "An error occured. Please try again" });
  }
}
