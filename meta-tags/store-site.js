const path = require("path");
const express = require("express");
const configMeta = require("../functions/config-meta");
const commaNumber = require("../functions/currency");

const Seller = require("../models/Seller");
const Product = require("../models/Product");

const router = express.Router();

const { siteName, motto } = require("../config/siteDetails");
const { getCategoryName } = require("../constants/productCategories");

router.use(express.static(path.join(__dirname, "../../client_store/build/")));

router.get("*", async (req, res, next) => {
  const { store_name, url } = req;

  let seller, product;

  const store = store_name.toUpperCase();
  const appendTitle = `${siteName} (${store})`;

  let result;

  switch (url) {
    case "/":
      result = configMeta(req, "store", {
        title: `${siteName} for ${store} - Connecting buyers with sellers`,
        description: `${appendTitle} is an online market for connecting buyers and sellers in ${store}.`,
      });
      break;

    case "/product/:id":
      product = await Product.findOne({ _id: req.params.id });

      if (product === null) {
        next();
        return;
      }
      seller = await Seller.findOne({ _id: product.seller_id });

      result = configMeta(req, "store", {
        title: `${product.name}, sold by ${seller.brand_name} at ${appendTitle}`,
        description: `Details for ${product.name} sold for ${commaNumber(
          product.price
        )} naira by ${seller.brand_name} on ${siteName}.`,
        imageUrl: product.img.url,
        keywords: `${product.name}, ${seller.fullname}, ${seller.brand_name}`,
      });
      break;

    case "/categories/:category":
      result = configMeta(req, "store", {
        title: `Products with category '${getCategoryName(
          req.params.category
        )}' at ${appendTitle}`,
        description: `Products with category '${getCategoryName(
          req.params.category
        )}' at ${appendTitle}`,
        keywords: req.params.category,
      });
      break;

    case "/sellers":
      result = configMeta(req, "store", {
        title: `Sellers at ${appendTitle}`,
        description: `All sellers in ${appendTitle}`,
      });
      break;

    case "/seller/:username":
      seller = await Seller.findOne({
        username: req.params.username,
      });
      if (seller === null) {
        next();
        return;
      }
      result = configMeta(req, "store", {
        title: `${seller.brand_name}, brand at ${appendTitle}`,
        description: `Details for ${seller.brand_name} managed by ${seller.fullname} on ${appendTitle}`,
        imageUrl: seller.img.url,
        keywords: `${seller.fullname}, ${seller.brand_name}`,
      });
      break;

    case "/about":
      result = configMeta(req, "store", {
        title: `About us - ${appendTitle}`,
        description: `${appendTitle} is an online market for connecting buyers and sellers in ${store}.`,
      });
      break;

    // Sign in pages

    case "/signin":
      result = configMeta(req, "store", {
        title: `Sign in - ${appendTitle}`,
        description: `Sign in - ${appendTitle}`,
      });
      break;

    case "/signup":
      result = configMeta(req, "store", {
        title: `Sign up - ${appendTitle}`,
        description: `Sign up - ${appendTitle}`,
      });
      break;

    // For a logged in seller

    case "/dashboard":
      result = configMeta(req, "store", {
        title: `My dashboard - ${appendTitle}`,
        description: "My dashboard for managing my products",
      });
      break;

    case "/product/add":
      result = configMeta(req, "store", {
        title: `Add new product - ${appendTitle}`,
        description: `Add new product - ${appendTitle}`,
      });
      break;

    case "/profile":
      result = configMeta(req, "store", {
        title: `My profile - ${appendTitle}`,
        description: `My profile - ${appendTitle}`,
      });
      break;

    case "/profile/edit":
      result = configMeta(req, "store", {
        title: `Edit profile - ${appendTitle}`,
        description: `Edit profile - ${appendTitle}`,
      });
      break;

    case "/profile/change_password":
      result = configMeta(req, "store", {
        title: `Change password - ${appendTitle}`,
        description: `Change password - ${appendTitle}`,
      });
      break;

    case "/product/update/:id":
      product = await Product.findOne({ _id: req.params.id });
      if (product === null) {
        next();
      }
      result = configMeta(req, "store", {
        title: `Update ${product.name} - ${appendTitle}`,
        description: `Update ${product.name} - ${appendTitle}`,
      });
      break;

    default:
      result = configMeta(req, "store", {
        title: siteName,
        description: motto,
      });
  }

  return res.send(result);
});

module.exports = router;
