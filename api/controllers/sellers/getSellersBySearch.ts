import { SELLERS_PER_PAGE } from "constants/index";
import Seller from "models/Seller";
import { selectSellerStr } from "utils/documentPopulate";

export default async function getSellersBySearch(req: any, res: any) {
  const { q = null, page: _page } = req.query;
  const criteria = {
    store: req.store_id,
    email_confirm: true,
    visible: true,
    $text: {
      $search: q,
    },
  };
  const page = parseInt(_page);
  const totalCount = await Seller.countDocuments({ ...criteria });
  // clear whitespaces (%20), change query to small letters, and test query with small letters
  try {
    const sellers = await Seller.find({ ...criteria })
      .select(selectSellerStr({ remove: ["cards", "banks", "wallet"] }))
      .limit(SELLERS_PER_PAGE)
      .skip(page * SELLERS_PER_PAGE);
    const totalPages = Math.ceil(totalCount / SELLERS_PER_PAGE) - 1; // since pages start from 0;;
    res.json({ sellers, totalPages, totalSellers: totalCount });
  } catch (err) {
    res.status(400).json({
      error: err,
      message: "No seller matched that query",
    });
  }
}
