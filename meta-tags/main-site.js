const express = require("express");
const configMeta = require("../functions/config-meta");
const path = require("path");

const router = express.Router();

const { siteName, motto } = require("../config/siteDetails");

router.use(express.static(path.join(__dirname, "../../client_main/build/")));

router.get("*", (req, res, next) => {
  const { store_name, url } = req;

  // store_name is appended from the subdomain
  if (store_name !== null && store_name !== undefined) {
    // skip this function, call the next which should handle store
    return next();
  }

  let result;

  switch (url) {
    case "/":

    case "/home":
      result = configMeta(req, "main", {
        title: `${siteName} - Connecting buyers with sellers`,
        description: `${siteName} is an online market for connecting buyers and sellers in school settings.`,
      });
      break;

    case "/stores":
      result = configMeta(req, "main", {
        title: `Avaliable stores in ${siteName}`,
        description: `This is a list of the available stores in ${siteName} for sellers and buyers to connect`,
      });
      break;

    case "/about":
      result = configMeta(req, "main", {
        title: `About us - ${siteName}`,
        description: `${siteName} is an online market for connecting buyers and sellers in school settings.`,
      });
      break;

    default:
      result = configMeta(req, "main", {
        title: siteName,
        description: motto,
      });
  }

  return res.send(result);
});


module.exports = router;
