const express = require("express");
const router = express.Router();
const { capitalize } = require("../../functions/strings");
const { shuffleArray } = require("../../functions/arrays");

const Product = require("../../models/Product");
const Store = require("../../models/Store");

const isSellerLoggedIn = require("../../middlewares/isSellerLoggedIn");

const multer = require("multer");
const Seller = require("../../models/Seller");
var upload = multer({ dest: "uploads/" });

const cloudinary = require("cloudinary").v2;

// ipInfo is gotten from express-ip middleware
const userAgentIP = (req) => req.ipInfo.ip;

// @title GET request products
// @desc fetch all products from mongoose document
// @access public

router.get("/", async (req, res) => {
  const products = await Product.find({
    store_id: req.store_id,
    visible: true,
  });
  return res.json(shuffleArray(products));
});

// @title GET request product categories
// @desc fetch categories from mongoose document of product collections
// @access public

router.get("/categories", async (req, res) => {
  const categories = await Product.find({
    store_id: req.store_id,
    visible: true,
  }).select("category");

  const filteredCategories = [];
  categories.forEach(({ category }) => {
    if (!filteredCategories.includes(category)) {
      filteredCategories.push(category);
    }
  });
  return res.json(filteredCategories);
});

router.get("/categories/:category", async (req, res) => {
  const categories = await Product.find({
    // store_id: req.store_id,
    visible: true,
    category: req.params.category,
  });

  res.json(categories);
});

// @title GET request product
// @desc fetch products from mongoose document by query
// @access public

router.get("/query", async (req, res, next) => {
  const { search, category } = req.query;

  const products = await Product.find({
    store_id: req.store_id,
    visible: true,
  });

  if (search) {
    // clear whitespaces (%20), change query to small letters, and test query with small letters
    let searchRegex = new RegExp(
      `${search.replace("%20", "").toLowerCase()}`,
      "ig"
    );

    const filteredProducts = products.filter((product) =>
      searchRegex.test(product.name)
    );

    return res.json(filteredProducts);
  }

  if (category) {
    const filteredProducts = products.filter(
      (product) => product.category === category
    );
    if (filteredProducts.length > 0) return res.json(filteredProducts);
  }

  next();
});

// @title GET request product
// @desc fetch single product from mongoose document by id
// @access public

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      store_id: req.store_id,
      visible: true,
    });
    return res.json(product);
  } catch (err) {
    return res.status(404).json({
      error: "Invalid id",
      message: "No product with that id exists",
    });
  }
});

// @title GET request product
// @desc fetch products from mongoose document by seller id
// @access public

router.get("/seller/:id", async (req, res) => {
  try {
    const products = await Product.find({
      seller_id: req.params.id,
      store_id: req.store_id,
      visible: true,
    });
    res.json(products);
  } catch (err) {
    res.status(404).json({
      error: err,
      message: "No seller with that id exists",
    });
  }
});

// @title UPDATE request product views
// @desc update product views in mongoose document
// @access public

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

// @title POST request product
// @desc upload new product to mongoose document
// @access public

router.post(
  "/",
  isSellerLoggedIn,
  upload.single("prodImage"),
  async (req, res) => {
    try {
      let { name, desc, category, price, store_name } = req.body;

      const loggedInSellerId = req.seller._id;

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
        shortname: store_name.toLowerCase(),
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

// @title DELETE request product
// @desc delete product from mongoose document
// @access public

router.delete("/:id", isSellerLoggedIn, async (req, res) => {
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

// @title UPDATE request product
// @desc update product in mongoose document
// @access public

router.post(
  "/update/:id",
  isSellerLoggedIn,
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

    try {
      const existingProduct = await Product.findOne({
        name,
        seller_id: req.seller._id,
      });
      if (existingProduct && existingProduct._id !== req.params.id) {
        // then there is an existing product with the name
        return res.status(400).json({
          message: `Product with the name '${name}' already exists`,
        });
      }

      const store = await Store.findOne({ shortname: store_name });

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
          seller_id: req.seller._id,
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
