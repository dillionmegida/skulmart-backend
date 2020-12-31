import {
  deleteProduct,
  getCategories,
  getProducts,
  getProductsByCategory,
  getProductsById,
  getProductsBySearch,
  getProductsBySeller,
  postProduct,
  updateProduct,
  updateProductViews,
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
router.get("/:id", getProductsById);

// Get products by seller
router.get("/seller/:id", getProductsBySeller);

// Update the number of views of a product
router.get("/views/:id", updateProductViews);

/*
 *
 * PRIVATE ROUTES
 *
 */

// Add a new product
router.post("/", isAuthenticated, upload.single("prodImage"), postProduct);

// Delete a product
router.delete("/:id", isAuthenticated, deleteProduct);

// Update a product
router.post("/update/:id", isAuthenticated, updateProduct);

export default router;
