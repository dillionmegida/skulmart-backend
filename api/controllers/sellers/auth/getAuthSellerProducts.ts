import { PRODUCTS_PER_PAGE } from "constants/index";
import SellerInterface from "interfaces/Seller";
import Product from "models/Product";
import { sliceAndReverse } from "utils/arrays";

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
      .select("-views_devices")
      .populate("store");

    const modifiedProducts = sliceAndReverse({
      arr: products,
      limit: PRODUCTS_PER_PAGE,
      currentPage: page,
    });

    res.json({ products: modifiedProducts, totalPages });
  } catch (err) {
    res.status(404).json({
      error: err,
      message: "Error. Coudn't load products",
    });
  }
}
