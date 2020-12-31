import Store from "models/Store";

export default async function getStoreByName(req: any, res: any) {
  const store = await Store.findOne({ shortname: req.params.shortname });
  if (store !== null) {
    // then store exists
    return res.json(store);
  } else {
    return res.status(404).json({
      error: "Shortname invalid",
      message: "No store with that name exists",
    });
  }
}
