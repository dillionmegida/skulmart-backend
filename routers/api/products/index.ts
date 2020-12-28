import express from "express";
const router = express.Router();
import { capitalize, replaceString } from "utils/strings";
import { shuffleArray } from "utils/arrays";

import Product from "models/Product";
import Store from "models/Store";

import multer from "multer";
import Seller from "models/Seller";
import isAuthenticated from "middlewares/isAuthenticated";
var upload = multer({ dest: "uploads/" });

import { v2 as cloudinary } from "cloudinary";
import {
  CLOUDINARY_PRODUCT_IMAGES_FOLDER,
  PRODUCTS_PER_PAGE,
} from "constants/index";
import { FREE_PLAN, SILVER_PLAN } from "constants/subscriptionTypes";
import { deleteImage, uploadImage } from "utils/image";

// ipInfo is gotten from express-ip middleware
const userAgentIP = (req: any) => req.ipInfo.ip;

/*
 *
 * PUBLIC ROUTES
 *
 */

// Get all products from a store
router.get("/", async (req: any, res: any) => {
  const { page: _page = 0 } = req.query;
  const criteria = {
    store_id: req.store_id,
    visible: true,
    quantity: {
      $gt: 0,
    },
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
router.get("/categories", async (req: any, res: any) => {
  const { page: _page } = req.query;
  const page = parseInt(_page);

  const criteria = {
    store_id: req.store_id,
    visible: true,
    quantity: {
      $gt: 0,
    },
  };

  const products = await Product.find({
    ...criteria,
  })
    .select("category")
    .limit(PRODUCTS_PER_PAGE * (page + 1));

  const categories: string[] = [];

  products.forEach(({ category }) => {
    if (!categories.includes(category)) {
      categories.push(category);
    }
  });

  return res.json({ categories });
});

// Get products by category
router.get("/categories/:category", async (req: any, res: any) => {
  const { page: _page } = req.query;
  const page = parseInt(_page);

  const { category } = req.params;

  const criteria = {
    store_id: req.store_id,
    visible: true,
    category,
    quantity: {
      $gt: 0,
    },
  };

  const totalCount = await Product.countDocuments({ ...criteria });
  const totalPages = Math.ceil(totalCount / PRODUCTS_PER_PAGE) - 1; // since pages start from 0;

  const products = await Product.find({
    ...criteria,
  })
    .limit(PRODUCTS_PER_PAGE)
    .skip(page * PRODUCTS_PER_PAGE);

  res.json({ products, totalPages });
});

// Get products by query
router.get("/query", async (req: any, res: any, next: any) => {
  const { q = null, page: _page } = req.query;

  if (q) {
    // clear whitespaces (%20), change query to small letters, and test query with small letters
    const qLowerCase = q.replace("%20", "").toLowerCase();
    let searchRegex = new RegExp(`${qLowerCase}`, "ig");

    const criteria = {
      store_id: req.store_id,
      visible: true,
      name: { $regex: searchRegex },
      quantity: {
        $gt: 0,
      },
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
router.get("/:id", async (req: any, res: any) => {
  try {
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
  } catch (err) {
    return res.status(400).json({ message: "Product with that id not found" });
  }
});

// Get products by seller
router.get("/seller/:id", async (req: any, res: any) => {
  try {
    const { page: _page } = req.query;
    const page = parseInt(_page);

    const criteria = {
      store_id: req.store_id,
      visible: true,
      seller_id: req.params.id,
      quantity: {
        $gt: 0,
      },
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
router.get("/views/:id", async (req: any, res: any) => {
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
      res.json({});
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
  async (req: any, res: any) => {
    try {
      let { name, desc, category, price, quantity } = req.body;

      const loggedInSellerId = req.user._id;

      const response = await Seller.findOne({
        _id: loggedInSellerId,
      });

      if (!response)
        return res.status(404).json({ message: "Seller not found" });

      const { subscription_type } = response;

      const subscriptionType =
        subscription_type === SILVER_PLAN.name
          ? { ...SILVER_PLAN }
          : { ...FREE_PLAN };

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
      quantity = parseInt(quantity);

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

      const imageDetails = await uploadImage({
        path: req.file.path,
        filename: replaceString({
          str: name,
          replace: " ",
          _with: "-",
        }).toLowerCase(),
        folder: CLOUDINARY_PRODUCT_IMAGES_FOLDER,
      });

      if (imageDetails.error)
        return res.status(400).json({
          error: "Upload failed. Please try again",
        });

      const { public_id, url } = imageDetails;

      const newProduct = new Product({
        img: { public_id, url },
        name,
        desc,
        category,
        price,
        store_id: store._id,
        seller_id: loggedInSellerId,
        visible: true,
        quantity,
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
router.delete("/:id", isAuthenticated, async (req: any, res: any) => {
  const product = await Product.findOneAndDelete({
    _id: req.params.id,
    store_id: req.store_id,
  });

  if (!product)
    return res.status(400).json({
      message: "No product with that id",
    });

  await deleteImage({
    public_id: product.img.public_id,
    errorMsg: "Could not delete product image",
  });

  res.json({
    message: "Product deleted successfully",
  });
});

// Update a product
router.post(
  "/update/:id",
  isAuthenticated,
  upload.single("prodImage"),
  async (req: any, res: any) => {
    let {
      name,
      desc,
      category,
      price,
      img_public_id,
      img_url,
      quantity,
    } = req.body;

    name = capitalize(name.trim());
    category = category.toLowerCase().trim();
    desc = desc.trim();
    quantity = parseInt(quantity);

    const authUser = req.user;

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
        await deleteImage({
          public_id,
          errorMsg: "Previous image could not be deleted",
        });

        const result = await uploadImage({
          path: req.file.path,
          filename: replaceString({
            str: name,
            replace: " ",
            _with: "-",
          }).toLowerCase(),
          folder: CLOUDINARY_PRODUCT_IMAGES_FOLDER,
        });

        if (result.error)
          return res.status(400).json({
            error: "Upload failed. Please try again",
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
          quantity,
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

export default router;
