import {
  getAllStores,
  getStoreById,
  getStoreByName,
} from "api/controllers/stores";
import express from "express";
const router = express.Router();

router.get("/", getAllStores);

router.get("/:id", getStoreById);

router.get("/name/:shortname", getStoreByName);

export default router;
