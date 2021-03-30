import {
  addToCart,
  getActivities,
  getCart,
  getNegotiation,
  getNegotiations,
  onboarding,
  removeFromCart,
  updateItemInCart,
} from "api/controllers/buyers";
import startNegotation from "api/controllers/buyers/auth/negotiations/startNegotiation";
import express from "express";
const router = express.Router();
import isAuthenticated from "middlewares/isAuthenticated";
import upload from "utils/multer";

/*
 *
 * PRIVATE ROUTES
 *
 */

router.use(isAuthenticated);

router.post("/onboarding", upload.single("avatar"), onboarding);

router.get("/cart", getCart);

// Get seller activities
router.get("/activities/all", getActivities);

// add item to cart
router.post("/cart/:product_id", addToCart);

// update item in cart
router.post("/cart/:cart_id/update", updateItemInCart);

// remove item from cart
router.delete("/cart/:product_id", removeFromCart);

// negotiations
router.get("/negotiations", getNegotiations);

router.post("/negotiations/:product_id", startNegotation);

router.get("/negotiations/:id", getNegotiation);

export default router;
