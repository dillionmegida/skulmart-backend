const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
require("./database");
// require("./database2");
require("./helpers/dashboard-monitor");

const expressip = require("express-ip");
// cloudinary configurations
const cloudinary = require("cloudinary").v2;

const session = require("express-session");
const mongoSession = require("connect-mongodb-session")(session);

const cleanups = require("./cleanups");

const Seller = require("./models/Seller");

const mainMeta = require("./meta-tags/main-site");
const storeMeta = require("./meta-tags/store-site");
const adminMeta = require("./meta-tags/admin-site");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();

app.use(expressip().getIpInfoMiddleware);
app.use(bodyParser.json());
app.use(cors());

const sessionConfig = {
  store: new mongoSession({
    // uri: "mongodb://localhost:27017/market-hub",
    uri: require("./config/keys").MongoURI,
    collection: "mySessions",
  }),
  secret: process.env.COOKIE_SECRET || "TESTING_SECRET",
  resave: false,
  saveUninitialized: true,
  cookie: {
    // 1 month
    maxAge: 31 * 24 * 60 * 60 * 100,
    // secure: true,
    domain: "skulmart.com",
    // domain: "localhost",
  },
};

app.use(session(sessionConfig));

// log out any logged in seller
app.get("/logout", (req, res) => {
  req.session.destroy();
  // res.redirect("/");
});

const getStore = require("./middlewares/getstore");
app.use(getStore);

app.get("/cleanups", async (req, res) => {
  await cleanups();
  res.send("hello");
});

app.use(async (req, _, next) => {
  // if session does not exist, go to next function
  // seller_id is attached to the session when the seller logs in
  console.log(req.session);
  if (!req.session.seller_id) {
    req.seller = null;
    return next();
  }

  // else, add seller to the req object, which would contain the seller details
  let seller = await Seller.findById(req.session.seller_id).select("-password");
  // let seller = await Seller.findOne({ email: "dillionmegida@gmail.com" });

  if (seller.store_name !== req.store_name) {
    // store_name gotten from getStore
    // that means seller is not in his own store
    req.seller = null;
    return next();
  }

  req.seller = seller;

  next();
});

// @title API Routes
// @desc Here are my routes for market-hub
// @access Public

const products = require("./routers/api/products");
const sellers = require("./routers/api/sellers");
const stores = require("./routers/api/stores");
const emailConfirmations = require("./routers/api/emailConfirmations");
const resetPasswords = require("./routers/api/resetPasswords");

const admin = require("./routers/api/admin");

// api routes

app.use("/api/products/", products);
app.use("/api/sellers/", sellers);
app.use("/api/stores/", stores);
app.use("/confirm_email/", emailConfirmations);
app.use("/reset_password/", resetPasswords);

app.use("/api/admin", admin);

const subdomain = require("./middlewares/subdomain");
app.use(subdomain(mainMeta, storeMeta, adminMeta));

// @title Listen port set to 5000

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
