import {
  addToCart,
  getCart,
  initializeBuyProduct,
  removeFromCart,
  updateItemInCart,
} from "api/controllers/buyers";
import express from "express";
const router = express.Router();
import isAuthenticated from "middlewares/isAuthenticated";

/*
 *
 * PRIVATE ROUTES
 *
 */

router.get("/cart", isAuthenticated, getCart);

// add item to cart
router.post("/cart/:product_id", isAuthenticated, addToCart);

// update item in cart
router.post("/cart/:cart_id/update", isAuthenticated, updateItemInCart);

// remove item from cart
router.delete("/cart/:product_id", isAuthenticated, removeFromCart);

router.post(
  "/product/payment/initialize",
  isAuthenticated,
  initializeBuyProduct
);

export default router;
