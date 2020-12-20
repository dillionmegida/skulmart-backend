const Store = require("../models/Store");
const siteDetails = require("../config/siteDetails");

module.exports = async function getStore(req, res, next) {
  const { store_name, main = null } = req.headers;

  if (main !== null)
    // then API requests are coming from the main app
    return next();

  // if (subdomain === "admin") {
  //   req.admin = true;
  //   return next();
  // }

  const store = await Store.findOne({ shortname: store_name });

  // then store does not exist
  if (!store)
    return res.redirect(siteDetails.domain + "/no-store?store=" + store_name);

  req.store_id = store._id;

  req.store_name = store.shortname;

  next();
};
