import express from "express";
const router = express.Router();

/*
 *
 * PUBLIC ROUTES
 *
 */

router.get("/", async (req, res) => {
  res.json({ buyers: [] });
});

/*
 *
 * PRIVATE ROUTES
 *
 */

export default router;
