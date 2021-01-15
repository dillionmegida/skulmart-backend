import { PRODUCTS_PER_PAGE } from "constants/index";
import Product from "models/Product";
import { shuffleArray } from "utils/arrays";

export default async function getProducts(req: any, res: any) {
  const { page: _page = 0 } = req.query;
  const criteria = {
    store: req.store_id,
    visible: true,
    quantity: {
      $gt: 0,
    },
  };
  const page = parseInt(_page);
  const totalCount = await Product.countDocuments({ ...criteria });
  const products = await Product.find({ ...criteria })
    .limit(PRODUCTS_PER_PAGE)
    .skip(page * PRODUCTS_PER_PAGE);

  const totalPages = Math.ceil(totalCount / PRODUCTS_PER_PAGE) - 1; // since pages start from 0;

  return res.json({
    products: shuffleArray(products),
    totalPages,
    totalProducts: totalCount
  });
}