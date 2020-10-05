const { siteName } = require("../config/siteDetails");
const Store = require("../models/Store");
const path = require("path");

module.exports = async function getStore(req, res, next) {
  const [subdomain] = req.hostname.split(".");

  if (["www", siteName.toLowerCase()].includes(subdomain)) {
    req.subdomain = null;
    return next();
  }

  if (subdomain === "admin") {
    req.admin = true;
    return next();
  }

  const store = await Store.findOne({ shortname: subdomain });

  // then store does not exist
  if (!store) return res.sendFile(path.join(__dirname, "../store404.html"));

  req.store_id = store._id;

  req.store_name = store.shortname;

  next();
};
