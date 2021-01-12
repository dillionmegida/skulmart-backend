import { makeTransaction } from "api/controllers/transactions";
import express from "express";
import isAuthenticated from "middlewares/isAuthenticated";
const router = express.Router();

router.use(isAuthenticated);

// make transaction - buy everything in cart
router.post("/", makeTransaction);

export default router;
