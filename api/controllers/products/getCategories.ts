import { PRODUCTS_PER_PAGE } from "constants/index";
import Product from "models/Product";

// categories are fetched this way to ensure that
// there is at least a product with that category
export default async function getCategories(req: any, res: any) {
  const { page: _page } = req.query;
  const page = parseInt(_page);

  const criteria = {
    store: req.store_id,
    visible: true,
    quantity: {
      $gt: 0,
    },
  };

  const products = await Product.find({
    ...criteria,
  })
    .select("category")
    .limit(PRODUCTS_PER_PAGE * (page + 1));

  const categories: string[] = [];

  products.forEach(({ category }) => {
    if (!categories.includes(category)) {
      categories.push(category);
    }
  });

  return res.json({ categories });
}
