import { PRODUCTS_PER_PAGE } from "constants/index";
import SellerInterface from "interfaces/Seller";
import Product from "models/Product";

export default async function getAuthSellerProducts(req: any, res: any) {
  try {
    const { page: _page } = req.query;
    const page = parseInt(_page);

    const loggedInSeller = req.user as SellerInterface;

    const criteria = {
      store: loggedInSeller.store,
      visible: true,
      seller: loggedInSeller._id,
    };

    const totalCount = await Product.countDocuments({ ...criteria });
    const totalPages = Math.ceil(totalCount / PRODUCTS_PER_PAGE) - 1; // since pages start from 0;

    const products = await Product.find({
      ...criteria,
    })
      .limit(PRODUCTS_PER_PAGE)
      .skip(page * PRODUCTS_PER_PAGE)
      .populate("store");

    res.json({ products, totalPages });
  } catch (err) {
    res.status(404).json({
      error: err,
      message: "Error. Coudn't load products",
    });
  }
}
