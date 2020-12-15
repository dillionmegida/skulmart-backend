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

const cleanups = require("./cleanups");

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

const getStore = require("./middlewares/getstore");

app.get("/test", async (req, res) => {

  // get all verified emails
  // const emails = await Seller.find({email_confirm: true}).select("email");
  // let emailString = "";
  // for (let i = 0; i < emails.length; i++) {
  //   emailString = emailString + emails[i].email + ",";
  // }
  // console.log({ emailString });

  await cleanups();

});

app.use(getStore);

app.get("/cleanups", async (req, res) => {
  await cleanups();
  res.send("hello");
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
const Seller = require("./models/Seller");

// api routes

app.use("/api/products/", products);
app.use("/api/sellers/", sellers);
app.use("/api/stores/", stores);
app.use("/confirm_email/", emailConfirmations);
app.use("/reset_password/", resetPasswords);

app.use("/api/admin", admin);

// @title Listen port set to 5000

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
