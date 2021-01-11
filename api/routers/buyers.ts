import {
  addToCart,
  getCart,
  makeTransaction,
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

router.use(isAuthenticated);

router.get("/cart", getCart);

// add item to cart
router.post("/cart/:product_id", addToCart);

// update item in cart
router.post("/cart/:cart_id/update", updateItemInCart);

// remove item from cart
router.delete("/cart/:product_id", removeFromCart);

// make transaction - buy everything in cart
router.post("/transaction", makeTransaction);

export default router;
