const Store = require("../models/Store");
const siteDetails = require("../config/siteDetails");

module.exports = async function getStore(req, res, next) {
  const { main = null } = req.headers;
  const subdomain = req.hostname.split(".skulmart")[0];

  const store_name =
    subdomain === "localhost" ? /* then we're on dev */ "kwasu" : subdomain;

  console.log({ subdomain, store_name });

  if (main !== null)
    // then API requests are coming from the main app
    return next();

  // if (subdomain === "admin") {
  //   req.admin = true;
  //   return next();
  // }

  const store = await Store.findOne({ shortname: store_name });
  console.log({ store });

  // then store does not exist
  if (!store)
    return res.redirect(siteDetails.domain + "/no-store?store=" + store_name);

  req.store_id = store._id;

  req.store_name = store.shortname;

  next();
};
