import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import Seller from "./models/Seller";
import Buyer from "./models/Buyer";
import StoreInterface from "interfaces/Store";
import fs from "fs";

//@ts-ignore
import Engage from "@engage_so/js";

import { config } from "dotenv";
config();

import("./database");
import("helpers/dashboard-monitor");

//@ts-ignore
import expressip from "express-ip";

// cloudinary configurations
import { v2 as cloudinary } from "cloudinary";

import cleanups from "./cleanups";

Engage.init({
  key: process.env.ENGAGE_PRIVATE_KEY,
  secret: process.env.ENGAGE_SECRET_KEY,
});


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
  //   const emails = await Seller.find({ email_confirm: true }).select("email");
  //   let emailString = "";
  //   for (let i = 0; i < emails.length; i++) {
  //     emailString = emailString + emails[i].email + ",";
  //   }
  //   console.log({ emailString });

  //   get all verified phone numbers
  //   const numbers = await Seller.find({ email_confirm: true })
  //     .select("whatsapp brand_name fullname store")
  //     .populate("store");
  //   let phoneStr = "";
  //   for (let i = 0; i < numbers.length; i++) {
  //     const { whatsapp, brand_name, fullname } = numbers[i];
  //     // @ts-ignore
  //     const store = numbers[i].store as StoreInterface;

  //     if (whatsapp)
  //       phoneStr +=
  //         whatsapp +
  //         " - " +
  //         brand_name +
  //         " - " +
  //         fullname +
  //         " - " +
  //         store.shortname +
  //         "\n";
  //   }
  //   console.log({ phoneStr });

  //   await cleanups();

    const sellers = await Seller.find().select(
      "verified brand_category fullname brand_name email visible store views_count createdAt whatsapp user_type email_confirm"
    );
    fs.writeFileSync("sellers.json", JSON.stringify(sellers, null, 2));

//   const buyers = await Buyer.find().select(
//     "createdAt fullname email store user_type phone email_confirm"
//   );
//   fs.writeFileSync("buyers.json", JSON.stringify(buyers, null, 2));
//     console.log(JSON.stringify(sellers, null, 2));
});

app.use(getStore);

app.get("/cleanups", async (req: any, res: any) => {
  await cleanups();
  res.send("hello");
});

// @title API Routes
// @desc Here are my routes for market-hub
// @access Public

import products from "api/routers/products";
import sellers from "api/routers/sellers";
import buyers from "api/routers/buyers";
import users from "api/routers/users";
import stores from "api/routers/stores";
import orders from "api/routers/orders";
import negotiations from "api/routers/negotiations";
import shorten_url from "api/routers/shorten_url";
import paystackWebhook from "api/routers/paystackWebhook";

import admin from "api/routers/admin";
import main from "api/routers/main";
import { PAYSTACK_WEBHOOK } from "./constants";

// api routes

app.use("/api/products", products);
app.use("/api/sellers", sellers);
app.use("/api/buyers", buyers);
app.use("/api/stores", stores);
app.use("/api/users", users);
app.use("/api/orders", orders);
app.use("/api/negotiations", negotiations);
app.use("/api/shorten_url", shorten_url);
app.use(PAYSTACK_WEBHOOK, paystackWebhook);

app.use("/api/admin", admin);
app.use("/api/main", main);

// @title Listen port set to 5000

const port = process.env.PORT || 5000;

app.use("/", (req, res, next) => {
  res.send("/");
  next();
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
