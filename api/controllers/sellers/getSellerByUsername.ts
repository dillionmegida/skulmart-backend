import Product from "models/Product";
import Seller from "models/Seller";
import { selectSellerStr } from "utils/documentPopulate";

export default async function getSellerByUsername(req: any, res: any) {
  const seller = await Seller.findOne({
    username: req.params.username,
    store: req.store_id,
    visible: true,
    subscription_type: { $ne: undefined },
  }).select(selectSellerStr);
  if (seller === null) {
    // seller does not exist
    return res.status(404).json({
      error: "Username invalid",
      message: "No seller with that username",
    });
  }
  const totalProducts = await Product.countDocuments({
    store: req.store_id,
    visible: true,
    seller: seller._id,
  });
  return res.json({ seller, totalProducts });
}
