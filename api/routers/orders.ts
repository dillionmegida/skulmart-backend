import {
  getOrders,
  getOrdersByRef,
  makeOrder,
  getOrder,
  receivedOrder,
  reviewOrder
} from "api/controllers/orders";
import express from "express";
import isAuthenticated from "middlewares/isAuthenticated";
const router = express.Router();

router.use(isAuthenticated);

// make order - buy everything in cart
router.post("/", makeOrder);

// get all buyer's orders
router.get("/", getOrders);

// get an order
router.get("/id/:id", getOrder);

// get all buyer's orders by ref
router.get("/ref/:ref", getOrdersByRef);

// post request after confirms receiving order
router.post("/received/:id", receivedOrder);

// buyer reviews order purchased
router.post("/review/:id", reviewOrder);

export default router;
