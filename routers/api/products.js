const express = require("express");
const router = express.Router();
const { capitalize } = require("../../functions/strings");
const { shuffleArray } = require("../../functions/arrays");

const Product = require("../../models/Product");
const Store = require("../../models/Store");

const multer = require("multer");
const Seller = require("../../models/Seller");
const isAuthenticated = require("../../middlewares/isAuthenticated");
const getAuthUser = require("../../functions/getAuthUser");
var upload = multer({ dest: "uploads/" });

const cloudinary = require("cloudinary").v2;
const { PRODUCTS_PER_PAGE } = require("../../constants");

// ipInfo is gotten from express-ip middleware
const userAgentIP = (req) => req.ipInfo.ip;

/*
 *
 * PUBLIC ROUTES
 *
 */

// Get all products from a store
router.get("/", async (req, res) => {
  const { page: _page = 0 } = req.query;
  const criteria = {
    store_id: req.store_id,
    visible: true,
  };
  const page = parseInt(_page);
  const totalCount = await Product.countDocuments({ ...criteria });
  const products = await Product.find({ ...criteria })
    .limit(PRODUCTS_PER_PAGE)
    .skip(page * PRODUCTS_PER_PAGE);

  const totalPages = Math.ceil(totalCount / PRODUCTS_PER_PAGE) - 1; // since pages start from 0;

  return res.json({
    products: shuffleArray(products),
    totalPages,
  });
});

// Get all categories
// categories are fetched this way to ensure that
// there is at least a product with that category
router.get("/categories", async (req, res) => {
  const { page: _page } = req.query;
  const page = parseInt(_page);

  const criteria = {
    store_id: req.store_id,
    visible: true,
  };

  const totalCount = await Product.countDocuments({ ...criteria });
  const totalPages = Math.ceil(totalCount / PRODUCTS_PER_PAGE) - 1; // since pages start from 0;

  const products = await Product.find({
    ...criteria,
  })
    .select("category")
    .limit(PRODUCTS_PER_PAGE * (page + 1));

  const categories = [];

  products.forEach(({ category }) => {
    if (!categories.includes(category)) {
      categories.push(category);
    }
  });

  return res.json({ categories, totalPages });
});

// Get products by category
router.get("/categories/:category", async (req, res) => {
  const { page: _page } = req.query;
  const page = parseInt(_page);

  const { category } = req.params;

  const criteria = {
    store_id: req.store_id,
    visible: true,
    category,
  };

  const products = await Product.find({
    ...criteria,
  })
    .limit(PRODUCTS_PER_PAGE)
    .skip(page * PRODUCTS_PER_PAGE);

  res.json({ products });
});

// Get products by query
router.get("/query", async (req, res, next) => {
  const { q = null, page: _page } = req.query;

  if (q) {
    // clear whitespaces (%20), change query to small letters, and test query with small letters
    const qLowerCase = q.replace("%20", "").toLowerCase();
    let searchRegex = new RegExp(`${qLowerCase}`, "ig");

    const criteria = {
      store_id: req.store_id,
      visible: true,
      name: { $regex: searchRegex },
    };
    const page = parseInt(_page);
    const totalCount = await Product.countDocuments({ ...criteria });
    const totalPages = Math.ceil(totalCount / PRODUCTS_PER_PAGE) - 1; // since pages start from 0;

    const products = await Product.find({
      ...criteria,
    })
      .limit(PRODUCTS_PER_PAGE)
      .skip(page * PRODUCTS_PER_PAGE);

    res.json({ products, totalPages });
  }
});

// Get product by id
router.get("/:id", async (req, res) => {
  const product = await Product.findOne({
    _id: req.params.id,
    store_id: req.store_id,
    visible: true,
  });
  if (product === null)
    return res.status(404).json({
      error: "Invalid id",
      message: "No product with that id exists",
    });
  return res.json({ product });
});

// Get products by seller
router.get("/seller/:id", async (req, res) => {
  try {
    const { page: _page } = req.query;
    const page = parseInt(_page);

    const criteria = {
      store_id: req.store_id,
      visible: true,
      seller_id: req.params.id,
    };

    const totalCount = await Product.countDocuments({ ...criteria });
    const totalPages = Math.ceil(totalCount / PRODUCTS_PER_PAGE) - 1; // since pages start from 0;

    const products = await Product.find({
      ...criteria,
    })
      .limit(PRODUCTS_PER_PAGE)
      .skip(page * PRODUCTS_PER_PAGE);
    res.json({ products, totalPages });
  } catch (err) {
    res.status(404).json({
      error: err,
      message: "No seller with that id exists",
    });
  }
});

// Update the number of views of a product
router.get("/views/:id", async (req, res) => {
  const id = req.params.id;
  const ip = userAgentIP(req);
  try {
    const product = await Product.findOne({
      _id: id,
      store_id: req.store_id,
      visible: true,
    });
    if (product !== null) {
      // then product exists
      if (!product.views.devices.includes(ip)) {
        // then this device has not viewed the product before
        product.views.count++;
        product.views.devices.push(ip);
        await Product.findByIdAndUpdate(id, {
          $set: {
            views: {
              count: product.views.count,
              devices: [...product.views.devices],
            },
          },
        });
      }
    }
  } catch (err) {
    res.status(404).json({
      error: err,
      message: "Id does not exist",
    });
  }
});

/*
 *
 * PRIVATE ROUTES
 *
 */

// Add a new product
router.post(
  "/",
  isAuthenticated,
  upload.single("prodImage"),
  async (req, res) => {
    try {
      let { name, desc, category, price } = req.body;

      const loggedInSellerId = getAuthUser(req)._id;

      const { subscription_type: subscriptionType } = await Seller.findOne({
        _id: loggedInSellerId,
      });

      let maxProducts = subscriptionType.max_products;

      const allProducts = await Product.find({
        store_id: req.store_id,
        seller_id: loggedInSellerId,
      });

      if (allProducts.length >= maxProducts)
        return res.status(400).json({
          message: `The plan you subscribed for (${subscriptionType.name} plan) only supports maximum of ${maxProducts} products.
        You can delete one product to give room for another.`,
        });

      name = capitalize(name.trim());
      category = category.toLowerCase().trim();
      desc = desc.trim();

      // Check if the same name has been posted by the same seller
      const existingProduct = await Product.findOne({
        name,
        seller_id: loggedInSellerId,
      });

      if (existingProduct) {
        return res.status(400).json({
          message: `You have a similar product with name '${name}' before`,
        });
      }

      const store = await Store.findOne({
        shortname: req.store_name.toLowerCase(),
      });

      if (store === null) {
        // then the store does not exist
        // this may never happen though, because if there is no store, server.js will redirectoy to homepage
        return res.status(400).json({
          error: "Store unavailable",
          message: "Error creating product. Please try again",
        });
      }

      const { public_id, url } = await cloudinary.uploader.upload(
        req.file.path,
        {
          public_id: req.file.filename,
          folder: "market-hub/product_images",
        }
      );

      const newProduct = new Product({
        img: { public_id, url },
        name,
        desc,
        category,
        price,
        store_id: store._id,
        seller_id: loggedInSellerId,
        visible: true,
      });

      await newProduct.save();

      res.json({
        message: "Product uploaded successfully",
      });
    } catch (err) {
      console.log("An error occured during product upload >> ", err);
      res.status(500).json({
        error: err,
        message: "Product could not be added. Please try again",
      });
    }
  }
);

// Delete a product
router.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      store_id: req.store_id,
    });
    cloudinary.uploader.destroy(product.img.public_id, (error) => {
      if (error) {
        console.log("Could not delete product image >> ", error);
      }
    });
    // even if the image does not delete, our try block passed the first line
    // which means it has been deleted from database
    res.json({
      message: "Product deleted successfully",
    });
  } catch (err) {
    res.status(400).json({
      error: err,
      message: "No product with that id",
    });
  }
});

// Update a product
router.post(
  "/update/:id",
  isAuthenticated,
  upload.single("prodImage"),
  async (req, res) => {
    let {
      name,
      desc,
      category,
      price,
      store_name,
      img_public_id,
      img_url,
    } = req.body;

    name = capitalize(name.trim());
    category = category.toLowerCase().trim();
    desc = desc.trim();

    const authUser = getAuthUser(req);

    try {
      const existingProduct = await Product.findOne({
        name,
        seller_id: authUser,
      });
      if (existingProduct && existingProduct._id !== req.params.id) {
        // then there is an existing product with the name
        return res.status(400).json({
          message: `Product with the name '${name}' already exists`,
        });
      }

      const store = await Store.findOne({ shortname: req.store_name });

      if (store === null) {
        // then the store does not exist
        // this may never happen though, because if there is no store, server.js will redirectoy to homepage
        return res.status(400).json({
          error: "Store unavailable",
          message: "Error updating product. Please try again",
        });
      }

      // former image details
      let public_id = img_public_id;
      let url = img_url;

      if (req.file !== undefined) {
        // then a new image was selected

        // delete the previous image stored
        await cloudinary.uploader.destroy(public_id, (error) => {
          if (error) {
            // then previous image was not deleted
            console.log("Previous image could not be deleted >> ", error);
            // still continue the update process, even if image was not deleted
          }
        });

        const result = await cloudinary.uploader.upload(req.file.path, {
          public_id: req.file.filename,
          folder: "market-hub/product_images",
        });

        // change image details to the new image
        public_id = result.public_id;
        url = result.url;
      }

      await Product.findByIdAndUpdate(req.params.id, {
        $set: {
          img: {
            public_id,
            url,
          },
          name,
          desc,
          category,
          price,
          store_id: store._id,
          seller_id: authUser,
        },
      });

      return res.json({
        message: `Product updated successfully`,
      });
    } catch (err) {
      console.log("Could not update product >> ", err);
      res.status(500).json({
        error: err,
        message: "Error occured. Please try again",
      });
    }
  }
);

module.exports = router;
