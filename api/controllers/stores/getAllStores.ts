import Store from "models/Store";

export default async function getAllStores(req: any, res: any) {
  const stores = await Store.find();
  return res.json({ stores });
}
