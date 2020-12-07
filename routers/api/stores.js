const express = require("express");
const router = express.Router();

const Store = require("../../models/Store");

router.get("/", async (req, res) => {
  const stores = await Store.find();
  return res.json(stores);
});

router.get("/:id", async (req, res) => {
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

router.get("/name/:shortname", async (req, res) => {
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

module.exports = router;
