import Store from "models/Store";

export default async function getStoreById(req: any, res: any) {
   try {
    const store = await Store.findById(req.params.id);
    res.json(store);
  } catch (err) {
    return res.status(404).json({
      error: err,
      message: "No store with that id",
    });
  }
}