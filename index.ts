import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

import { config } from "dotenv";
config();

import("./database");
import("helpers/dashboard-monitor");

import expressip from "express-ip";

// cloudinary configurations
import { v2 as cloudinary } from "cloudinary";

import cleanups from "./cleanups";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();

app.use(expressip().getIpInfoMiddleware);
app.use(bodyParser.json());
app.use(cors());

import getStore from "./middlewares/getstore";

app.get("/test", async (req: any, res: any) => {
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

app.get("/cleanups", async (req: any, res: any) => {
  await cleanups();
  res.send("hello");
});

// @title API Routes
// @desc Here are my routes for market-hub
// @access Public

import products from "routers/api/products";
import sellers from "routers/api/sellers";
import stores from "routers/api/stores";
import emailConfirmations from "routers/api/emailConfirmations";
import resetPasswords from "routers/api/resetPasswords";

import admin from "routers/api/admin";
import Seller from "models/Seller";

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
