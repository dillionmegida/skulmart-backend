import Seller from "models/Seller";
import { selectSellerStr } from "utils/documentPopulate";

export default async function getSellerById(req: any, res: any) {
  const id = req.params.id;
  try {
    const seller = await Seller.findOne({
      _id: id,
      subscription_type: { $ne: undefined },
      visible: true,
    }).select(selectSellerStr);
    res.json({ seller });
  } catch {
    // then seller does not exist
    return res.status(404).json({
      error: "Invalid id",
      message: "No seller with that id exists",
    });
  }
}
