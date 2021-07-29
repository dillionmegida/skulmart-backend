import { Router } from "express";
const router = Router();

import {
  getAllSellers,
  getAllStores,
  getAllProducts,
} from "api/controllers/main";

router.get("/sellers", getAllSellers);
router.get("/stores", getAllStores);
router.get("/products", getAllProducts);

export default router;
