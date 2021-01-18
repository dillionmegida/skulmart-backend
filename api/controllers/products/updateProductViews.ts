import Product from "models/Product";

// ipInfo is gotten from express-ip middleware
const userAgentIP = (req: any) => req.ipInfo.ip;

export default async function updateProductViews(req: any, res: any) {
  const id = req.params.id;
  const ip = userAgentIP(req);
  try {
    const product = await Product.findOne({
      _id: id,
      visible: true,
    });
    if (product !== null) {
      // then product exists
      if (!product.views_devices.includes(ip)) {
        // then this device has not viewed the product before
        product.views_count++;
        product.views_devices.push(ip);
        await Product.findByIdAndUpdate(id, {
          $set: {
            views: {
              count: product.views_count,
              devices: [...product.views_devices],
            },
          },
        });
      }
    }
    res.json({});
  } catch (err) {
    res.status(404).json({
      error: err,
      message: "Id does not exist",
    });
  }
}
