const path = require("path");
const express = require("express");
const configMeta = require("../functions/config-meta");
const commaNumber = require("../functions/currency");

const Seller = require("../models/Seller");
const Product = require("../models/Product");

const router = express.Router();

const { siteName, motto } = require("../config/siteDetails");
const { getCategoryName } = require("../constants/productCategories");

router.use(express.static(path.join(__dirname, "../../admin/build/")));

router.get("*", async (req, res, next) => {
  res.sendFile(path.join(__dirname, "../../admin/build/index.html"));
});

module.exports = router;
