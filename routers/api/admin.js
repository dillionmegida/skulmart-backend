const router = require("express").Router();
const bcrypt = require("bcryptjs");

const Admin = require("../../models/Admin");
const Seller = require("../../models/Seller");
const Store = require("../../models/Store");
const Product = require("../../models/Product");

const isAdminLoggedIn = require("../../middlewares/isAdminLoggedIn");

router.post("/login", async (req, res) => {
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

router.get("/isLoggedIn", (req, res) => {
  if (req.session.admin_id === null || req.session.admin_id === undefined)
    return res.status(403).json({
      isLoggedIn: false,
    });

  return res.json({
    isLoggedIn: true,
  });
});

router.use(isAdminLoggedIn);

router.get("/sellers/:store", async (req, res) => {
  const { store } = req.params;
  const sellers = await Seller.find({ store_name: store });
  res.json(sellers);
});

router.get("/sellers", async (req, res) => {
  const { filter } = req.query;
  let result;
  switch (filter) {
    case "verified":
      result = await Seller.find({ email_confirm: true });
      break;
    case "subscribed":
      result = await Seller.find({ subscription_type: { $ne: null } });
      break;
    case "unsubscribedAndVerified":
      result = await Seller.find({
        email_confirm: true,
        subscription_type: null,
      });
      break;
    default:
      result = await Seller.find();
  }
  res.json(result);
});

router.post("/stores", async (req, res) => {
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

router.get("/stores", async (req, res) => {
  const stores = await Store.find();
  res.json(stores);
});

router.get("/products", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

module.exports = router;
