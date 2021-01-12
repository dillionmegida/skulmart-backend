import { makeOrder } from "api/controllers/orders";
import express from "express";
import isAuthenticated from "middlewares/isAuthenticated";
const router = express.Router();

router.use(isAuthenticated);

// make order - buy everything in cart
router.post("/", makeOrder);

export default router;
