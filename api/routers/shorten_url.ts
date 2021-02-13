import {
  shortenAndSave,
  getShortUrlDetails,
  redirectShortUrl,
} from "api/controllers/shorten_url";
import express from "express";
const router = express.Router();

// shorten a url and save it
router.post("/", shortenAndSave);

// get the details of a short url
router.get("/:short_url", getShortUrlDetails);

// get a short url and redirect to long url
router.get("/redirect/:short_url", redirectShortUrl);

export default router;
