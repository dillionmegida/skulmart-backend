import { SELLERS_PER_PAGE } from "constants/index";
import Seller from "models/Seller";

export default async function getSellerBySearch(req: any, res: any) {
  const { q = null, page: _page } = req.query;
  let searchRegex = new RegExp(`${q.replace("%20", "").toLowerCase()}`, "ig");
  const criteria = {
    store: req.store_id,
    email_confirm: true,
    $or: [
      {
        fullname: { $regex: searchRegex },
      },
      {
        brand_name: { $regex: searchRegex },
      },
    ],
  };
  const page = parseInt(_page);
  const totalCount = await Seller.countDocuments({ ...criteria });
  // clear whitespaces (%20), change query to small letters, and test query with small letters
  try {
    const sellers = await Seller.find({ ...criteria })
      .limit(SELLERS_PER_PAGE)
      .skip(page * SELLERS_PER_PAGE);
    const totalPages = Math.ceil(totalCount / SELLERS_PER_PAGE) - 1; // since pages start from 0;;
    res.json({ sellers, totalPages });
  } catch (err) {
    res.status(400).json({
      error: err,
      message: "No seller matched that query",
    });
  }
}
