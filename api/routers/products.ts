import {
  deleteProduct,
  getCategories,
  getProducts,
  getProductsByCategory,
  getProductById,
  getProductsBySearch,
  getProductsBySeller,
  postProduct,
  updateProduct,
  updateProductViews,
  getProductReviews,
  saveProduct,
} from "api/controllers/products";
import express from "express";
const router = express.Router();
import isAuthenticated from "middlewares/isAuthenticated";
import upload from "utils/multer";

// Get all products from a store
router.get("/", getProducts);

// Get all categories
router.get("/categories", getCategories);

// Get products by category
router.get("/categories/:category", getProductsByCategory);

// Get products by query
router.get("/query", getProductsBySearch);

// Get product by id
router.get("/:id", getProductById);

// Get product reviews
router.get("/reviews/:id", getProductReviews);

// Get products by seller
router.get("/seller/:username", getProductsBySeller);

// Update the number of views of a product
router.get("/views/:id", updateProductViews);

/*
 *
 * PRIVATE ROUTES
 *
 */

// Add a new product
router.post("/", isAuthenticated, upload.single("prodImage"), postProduct);

router.post("/save/:id", isAuthenticated, saveProduct);

// Delete a product
router.delete("/:id", isAuthenticated, deleteProduct);

// Update a product
router.post(
  "/update/:id",
  upload.single("prodImage"),
  isAuthenticated,
  updateProduct
);

export default router;
