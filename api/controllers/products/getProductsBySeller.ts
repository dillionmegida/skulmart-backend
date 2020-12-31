import { PRODUCTS_PER_PAGE } from "constants/index";
import Product from "models/Product";

export default async function getProductsBySeller(req: any, res: any) {
  try {
    const { page: _page } = req.query;
    const page = parseInt(_page);

    const criteria = {
      store: req.store_id,
      visible: true,
      seller: req.params.id,
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
  } catch (err) {
    res.status(404).json({
      error: err,
      message: "No seller with that id exists",
    });
  }
}