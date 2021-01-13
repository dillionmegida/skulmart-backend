import { getOrders, getOrdersByRef, makeOrder } from "api/controllers/orders";
import express from "express";
import isAuthenticated from "middlewares/isAuthenticated";
const router = express.Router();

router.use(isAuthenticated);

// make order - buy everything in cart
router.post("/", makeOrder);

// get all buyer's orders
router.get("/", getOrders);

/// get all buyer's orders by ref
router.get("/ref/:ref", getOrdersByRef);

export default router;
