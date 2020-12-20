import express from "express";
const router = express.Router();

import Store from "models/Store";

router.get("/", async (req: any, res: any) => {
  const stores = await Store.find();
  return res.json(stores);
});

router.get("/:id", async (req: any, res: any) => {
  // try is used at the top because if a wrong id is used, a cast ID error by mongo is produced
  try {
    const store = await Store.findById(req.params.id);
    res.json(store);
  } catch (err) {
    return res.status(404).json({
      error: err,
      message: "No store with that id",
    });
  }
});

router.get("/name/:shortname", async (req: any, res: any) => {
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
});

export default router;
