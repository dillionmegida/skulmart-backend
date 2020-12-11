const Store = require("../models/Store");
const siteDetails = require("../config/siteDetails");

module.exports = async function getStore(req, res, next) {
  const { store_name = null, main = null } = req.headers;

  if (store_name == null) {
    // then request isn't coming from the store site
    // cuz if it was, it would be sending the store_name in the headers
    const _store_name = req.hostname.split(".skulmart")[0];
    res.redirect(siteDetails.domain + "/no-store?store=" + _store_name);
  }

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
    res.redirect(siteDetails.domain + "/no-store?store=" + store_name);

  req.store_id = store._id;

  req.store_name = store.shortname;

  next();
};
