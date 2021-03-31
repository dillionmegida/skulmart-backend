import {
  getNegotiation,
  getNegotiationsOfBuyer,
  getNegotiationsOfSeller,
  updateNegotiationPrice,
  renegotiate,
} from "api/controllers/negotiations";
import startNegotation from "api/controllers/negotiations/startNegotiation";
import express from "express";
import isAuthenticated from "middlewares/isAuthenticated";
const router = express.Router();

router.use(isAuthenticated);

router.get("/buyer", getNegotiationsOfBuyer);

router.get("/seller", getNegotiationsOfSeller);

router.get("/:id", getNegotiation);

router.post("/:product_id", startNegotation);

router.put("/:id/price", updateNegotiationPrice);

router.put("/:id/renegotiate", renegotiate);

export default router;
