import { makeTransaction } from "api/controllers/transactions";
import express from "express";
import isAuthenticated from "middlewares/isAuthenticated";
const router = express.Router();

router.use(isAuthenticated);

router.post("/", makeTransaction);

export default router;
