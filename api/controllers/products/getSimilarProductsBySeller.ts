import { PRODUCTS_PER_PAGE } from "constants/index";
import Product from "models/Product";
import Seller from "models/Seller";
import { selectProductStr, selectSellerStr } from "utils/documentPopulate";

export default async function getProductsBySeller(req: any, res: any) {
  try {
    const { page: _page, product_id } = req.query as {
      page: string;
      product_id: string;
    };

    const page = parseInt(_page);

    const { username } = req.params;

    const seller = await Seller.findOne({ username, visible: true }).select(
      selectSellerStr({})
    );

    if (!seller)
      return res.status(400).json({
        message: "No seller with that username",
      });

    const product = await Product.findOne({ _id: product_id });

    if (!product)
      return res.status(400).json({
        message: "No product with that id",
      });

    const criteria = {
      store: req.store_id,
      visible: true,
      seller: seller._id,
      quantity: {
        $gt: 0,
      },
      $text: { $search: product.name },
    };

    const totalCount = await Product.countDocuments({ ...criteria });
    const totalPages = Math.ceil(totalCount / PRODUCTS_PER_PAGE) - 1; // since pages start from 0;

    const products = await Product.find({
      ...criteria,
    })
      .select(selectProductStr({}))
      .limit(PRODUCTS_PER_PAGE)
      .skip(page * PRODUCTS_PER_PAGE);

    res.json({
      products: products.filter((p) => {
        // remove the current product from the result
        return p._id.toString() !== product_id;
      }),
      totalPages,
      seller,
    });
  } catch (err) {
    res.status(404).json({
      error: err,
      message: "No seller with that id exists",
    });
  }
}
