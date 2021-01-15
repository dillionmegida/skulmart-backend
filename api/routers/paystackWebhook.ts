import express from "express";
import crypto from "crypto";
import { PAYSTACK_KEY } from "constants/index";

const router = express.Router();

// webhook that paystack calls after transactions
router.post("/", async (req: any, res: any) => {
  //validate event
  const hash = crypto
    .createHmac("sha512", PAYSTACK_KEY as string)
    .update(JSON.stringify(req.body))
    .digest("hex");
  if (hash == req.headers["x-paystack-signature"]) {
    // Retrieve the request's body
    const event = req.body;
  }
  res.send(200);
});

export default router;
