import { Router } from "express";
const router = Router();

import bcrypt from "bcryptjs";

import Admin from "../../models/Admin";
import Seller from "models/Seller";
import Store from "../../models/Store";
import Product from "../../models/Product";

import isAdminLoggedIn from "../../middlewares/isAdminLoggedIn";

router.post("/login", async (req: any, res: any) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email });

  if (admin === null)
    return res.status(400).json({
      message: "Username or password is incorrect",
    });

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch)
    // they they don't match
    return res.status(400).json({
      error: "Wrong credentials",
      message: "Username or password is incorrect",
    });

  // setting a session of seller_id for the logged in seller
  req.session.admin_id = admin._id;
  // req.session.admin_id = "hi";

  return res.json({
    message: "Admin authenticated 👍",
  });
});

router.get("/isLoggedIn", (req: any, res: any) => {
  if (req.session.admin_id === null || req.session.admin_id === undefined)
    return res.status(403).json({
      isLoggedIn: false,
    });

  return res.json({
    isLoggedIn: true,
  });
});

router.use(isAdminLoggedIn);

router.get("/sellers/:store", async (req: any, res: any) => {
  const { store } = req.params;
  const sellers = await Seller.find({ store_name: store });
  res.json(sellers);
});

router.get("/sellers", async (req: any, res: any) => {
  const { filter } = req.query;
  let result;
  switch (filter) {
    case "verified":
      result = await Seller.find({ email_confirm: true });
      break;
    case "subscribed":
      result = await Seller.find({ subscription_type: { $ne: "" } });
      break;
    case "unsubscribedAndVerified":
      result = await Seller.find({
        email_confirm: true,
        subscription_type: "",
      });
      break;
    default:
      result = await Seller.find();
  }
  res.json(result);
});

router.post("/stores", async (req: any, res: any) => {
  const { shortname, schoolname, location } = req.body;

  const exisitingStore = await Store.findOne({
    shortname,
  });

  if (exisitingStore !== null)
    return res.status(400).json({
      error: "store exists already",
      message: `${shortname} exists already`,
    });

  const store = new Store({
    shortname,
    schoolname,
    location,
  });

  await store.save();

  return res.json({
    message: "Store created successfully!",
  });
});

router.get("/stores", async (req: any, res: any) => {
  const stores = await Store.find();
  res.json(stores);
});

router.get("/products", async (req: any, res: any) => {
  const products = await Product.find();
  res.json(products);
});

export default router;
