import { SELLERS_PER_PAGE } from "constants/index";
import Seller from "models/Seller";

export default async function getAllSellers(req: any, res: any) {
  const { page: _page = 0 } = req.query;
  const criteria = {
    store: req.store_id,
    email_confirm: true,
  };
  const page = parseInt(_page);
  const totalCount = await Seller.countDocuments({ ...criteria });
  const sellers = await Seller.find({
    ...criteria,
  })
    .select("-password")
    .limit(SELLERS_PER_PAGE)
    .skip(page * SELLERS_PER_PAGE);

  const totalPages = Math.ceil(totalCount / SELLERS_PER_PAGE) - 1; // since pages start from 0;

  return res.json({ sellers, totalPages });
}
