import { PRODUCTS_PER_PAGE } from "constants/index";
import Product from "models/Product";

export default async function getProductsByCategory(req: any, res: any) {
  const { page: _page } = req.query;
  const page = parseInt(_page);

  const { category } = req.params;

  const criteria = {
    store: req.store_id,
    visible: true,
    category,
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

  res.json({ products, totalPages });
}