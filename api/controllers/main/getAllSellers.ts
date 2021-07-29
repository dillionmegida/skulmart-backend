import Seller from "models/Seller";
import { shuffleArray } from "utils/arrays";
import { selectSellerStr } from "utils/documentPopulate";

export default async function getAllSellers(req: any, res: any) {
  const criteria = {
    email_confirm: true,
    visible: true,
  };
  const totalCount = await Seller.countDocuments({ ...criteria });
  const sellers = await Seller.find({
    ...criteria,
  }).select(selectSellerStr({ remove: ["wallet", "cards", "banks"] }));

  return res.json({
    sellers: shuffleArray(sellers),
    totalSellers: totalCount,
  });
}
