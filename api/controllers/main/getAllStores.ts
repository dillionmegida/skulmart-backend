import Store from "models/Store";

export default async function getAllStores(req: any, res: any) {
  const criteria = {};
  const totalCount = await Store.countDocuments({ ...criteria });
  const stores = await Store.find({
    ...criteria,
  });

  return res.json({
    stores,
    totalStores: totalCount,
  });
}
