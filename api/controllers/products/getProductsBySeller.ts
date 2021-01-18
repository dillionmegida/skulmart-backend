import { PRODUCTS_PER_PAGE } from "constants/index";
import Product from "models/Product";
import Seller from "models/Seller";

export default async function getProductsBySeller(req: any, res: any) {
  try {
    const { page: _page } = req.query;
    const page = parseInt(_page);

    const { username } = req.params;

    const seller = await Seller.findOne({ username }).select("-password");

    if (!seller)
      return res.status(400).json({
        message: "No seller with that username",
      });

    const criteria = {
      store: req.store_id,
      visible: true,
      seller: seller._id,
      quantity: {
        $gt: 0,
      },
    };

    const totalCount = await Product.countDocuments({ ...criteria });
    const totalPages = Math.ceil(totalCount / PRODUCTS_PER_PAGE) - 1; // since pages start from 0;

    const products = await Product.find({
      ...criteria,
    })
      .limit(PRODUCTS_PER_PAGE)
      .skip(page * PRODUCTS_PER_PAGE);
    res.json({ products, totalPages, seller });
  } catch (err) {
    res.status(404).json({
      error: err,
      message: "No seller with that id exists",
    });
  }
}
