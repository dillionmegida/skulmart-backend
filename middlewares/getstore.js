const { siteName } = require("../config/siteDetails");
const Store = require("../models/Store");
const path = require("path");

module.exports = async function getStore(req, res, next) {
  const { store_name } = req.headers;

  // if (subdomain === "admin") {
  //   req.admin = true;
  //   return next();
  // }

  const store = await Store.findOne({ shortname: store_name });

  // console.log({store_name, store})

  // then store does not exist
  if (!store) return res.sendFile(path.join(__dirname, "../store404.html"));

  req.store_id = store._id;

  req.store_name = store.shortname;

  next();
};
