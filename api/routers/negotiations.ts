import {
  getNegotiation,
  getNegotiations,
  startNegotiation,
} from "api/controllers/negotations";
import express from "express";
const router = express.Router();
import isAuthenticated from "middlewares/isAuthenticated";

/*
 *
 * PRIVATE ROUTES
 *
 */

router.use(isAuthenticated);

router.get("/", getNegotiations);

router.post("/:product_id", startNegotiation);

router.get("/:id", getNegotiation);

export default router;
