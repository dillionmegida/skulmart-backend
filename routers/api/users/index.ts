import express from "express";
const router = express.Router();

import bcrypt from "bcryptjs";

import Seller from "models/Seller";
import { getToken } from "utils/token";
import isAuthenticated from "middlewares/isAuthenticated";
import { capitalize, bcryptPromise } from "utils/strings";
import sendEmailConfirmation from "mails/emailConfirmation";

import { v2 as cloudinary } from "cloudinary";

import multer from "multer";
import Store from "models/Store";
import { randomNumber } from "utils/numbers";
import EmailConfirmation from "models/EmailConfirmation";
import Buyer from "models/Buyer";
var upload = multer({ dest: "uploads/" });

// Create new user
router.post("/", upload.single("avatar"), async (req: any, res: any) => {
  try {
    let {
      fullname,
      brand_name,
      username,
      brand_desc,
      whatsapp,
      email,
      password,
      store_name,
    } = req.body;

    // confirm formats of inputs
    fullname = capitalize(fullname.trim());
    brand_name = capitalize(brand_name.trim());
    // remove spaces - though this is handled in the client side already but just incase
    username = username.trim().replace(/\s/g, "").toLowerCase();
    email = email.trim();

    // check if user already exists by username and email address
    const seller = await Seller.findOne({ $or: [{ username }, { email }] });

    if (seller) {
      // return if user exists
      if (seller.username === username) {
        return res.status(400).json({
          message: `Seller with username '${username}' already exists.`,
        });
      }
      if (seller.email === email) {
        if (seller.email === email) {
          return res.status(400).json({
            message: `Seller with email '${email}' already exists.`,
          });
        }
      }
    }

    const store = await Store.findOne({
      shortname: store_name.toLowerCase(),
    });

    if (!store)
      return res.status(400).json({
        message: "Store does not exist",
      });

    const { _id: store_id, shortname } = store;

    const { public_id, url } = await cloudinary.uploader.upload(req.file.path, {
      public_id: req.file.filename,
      folder: "market-hub/user_images",
    });

    // create an object of the body entry
    const newSeller = new Seller({
      img: { public_id, url },
      fullname,
      brand_name,
      username,
      brand_desc,
      whatsapp,
      email,
      password,
      store_id,
      store_name: shortname,
    });

    newSeller.password = await bcryptPromise(newSeller.password);

    await newSeller.save();

    const generatedHash = randomNumber();

    // seller_id would be sent with email, so that on verification, the email_confirm field would be true
    const seller_id = newSeller._id;

    const newEmailToBeConfirmed = new EmailConfirmation({
      generatedHash,
      seller_id,
    });

    await newEmailToBeConfirmed.save();

    const token = getToken({ _id: newSeller._id });

    const sendEmailResponse = await sendEmailConfirmation({
      generatedHash,
      email,
      name: fullname,
      store: store_name,
      type: "welcome",
    });

    if (!sendEmailResponse.error) {
      // then the email went successfully
      res.json({
        token,
        message:
          "Account Created Successfully 💛. Please check your email to confirm your email address then login",
      });
    } else {
      // well the seller was still saved even if email wasn't sent
      console.log(
        "Email confirmation couldn't be sent >> ",
        sendEmailResponse.error
      );
    }
  } catch (err) {
    console.log("An error occured during seller creation >> ", err);
    res.status(500).json({
      error: err,
      message: "Error occured. Please try again",
    });
  }
});

// Log in user
router.post("/login", async (req: any, res: any) => {
  let { usernameOrEmail, password, user_type } = req.body;

  // this applies to seller online, as they can provide a username or an email
  usernameOrEmail = usernameOrEmail.trim();

  let user = null;

  if (user_type === "seller") {
    const seller = await Seller.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });
    user = seller && Object.create(seller);
  } else {
    const buyer = await Buyer.findOne({
      email: usernameOrEmail,
    });
    user = buyer && Object.create(buyer);
  }

  if (!user) {
    // then no user exists with those credentials
    return res.status(400).json({
      message: "Username or password is incorrect",
    });
  }

  // compare passwords with bycrypt to see if they match
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    // then they don't match
    return res.status(400).json({
      error: "Wrong credentials",
      message: "Username or password is incorrect",
    });
  }

  if (user.email_confirm === false) {
    // then the user hasn't confirmed email address
    return res.status(400).json({
      error: "Email not confirmed",
      message: `Please confirm your email address with the confirmation link sent to ${user.email}`,
    });
  }

  const token = getToken({ _id: user._id });

  return res.json({
    token,
    message: "Authenticated 👍",
  });
});

router.get("/me", isAuthenticated, async (req: any, res: any) => {
  res.json(req.user);
});

export default router;
