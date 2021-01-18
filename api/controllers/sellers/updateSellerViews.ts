import Seller from "models/Seller";

// ipInfo is gotten from express-ip middleware
const userAgentIP = (req: any) => req.ipInfo.ip;

export default async function updateSellerViews(req: any, res: any) {
  const id = req.params.id;
  const ip = userAgentIP(req);
  try {
    const seller = await Seller.findOne({
      _id: id,
    });
    if (seller !== null) {
      if (!seller.views_devices.includes(ip)) {
        // then this device has not viewed the seller before
        seller.views_count++;
        seller.views_devices.push(ip);
        await Seller.findByIdAndUpdate(id, {
          $set: {
            views: {
              count: seller.views_count,
              devices: [...seller.views_devices],
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
