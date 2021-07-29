import Product from "models/Product";
import { selectProductStr } from "utils/documentPopulate";

export default async function getAllProducts(req: any, res: any) {
  const criteria = {
    visible: true,
  };
  const totalCount = await Product.countDocuments({ ...criteria });
  const products = await Product.find({
    ...criteria,
  }).select(selectProductStr({ remove: ["views_devices"] }));

  return res.json({
    products,
    totalProducts: totalCount,
  });
}
