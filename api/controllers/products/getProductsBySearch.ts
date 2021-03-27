import { PRODUCTS_PER_PAGE } from "constants/index";
import Product from "models/Product";
import { selectProductStr } from "utils/documentPopulate";

export default async function getProductsBySearch(req: any, res: any) {
  const { q = null, page: _page } = req.query;

  if (q) {
    const criteria = {
      store: req.store_id,
      visible: true,
      $text: { $search: q },
      quantity: {
        $gt: 0,
      },
    };
    const page = parseInt(_page);
    const totalCount = await Product.countDocuments({ ...criteria });
    const totalPages = Math.ceil(totalCount / PRODUCTS_PER_PAGE) - 1; // since pages start from 0;

    const products = await Product.find({
      ...criteria,
    })
      .select(selectProductStr)
      .limit(PRODUCTS_PER_PAGE)
      .skip(page * PRODUCTS_PER_PAGE);

    res.json({ products, totalPages, totalProducts: totalCount });
  }
}
