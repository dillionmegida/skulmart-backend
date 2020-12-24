import express from "express";
const router = express.Router();

import bcrypt from "bcryptjs";

import Seller from "models/Seller";
import { getToken } from "utils/token";
import isAuthenticated from "middlewares/isAuthenticated";
import { capitalize, bcryptPromise } from "utils/strings";
import sendEmailConfirmation from "mails/emailConfirmation";
import ResetPassword from "models/ResetPassword";
import resetPassword from "mails/resetPassword";

import { v2 as cloudinary } from "cloudinary";

import multer from "multer";
import Store from "models/Store";
import { randomNumber } from "utils/numbers";
import EmailConfirmation from "models/EmailConfirmation";
import Buyer from "models/Buyer";
import BuyerInterface from "interfaces/Buyer";
import SellerInterface from "interfaces/Seller";
var upload = multer({ dest: "uploads/" });

// Create new user
router.post("/", upload.single("avatar"), async (req: any, res: any) => {
  const body: SellerInterface | BuyerInterface = { ...req.body };

  try {
    let { store_name } = body;

    const store = await Store.findOne({
      shortname: store_name.toLowerCase(),
    });

    if (!store)
      return res.status(400).json({
        message: "Store does not exist",
      });

    const { _id: store_id, shortname } = store;

    let user = null;

    if (body.type !== "seller" && body.type !== "buyer")
      return {
        error: true,
        message: "User type not specified",
      };

    const { public_id, url } = await cloudinary.uploader.upload(req.file.path, {
      public_id: req.file.filename,
      folder: "market-hub/user_images",
    });

    if (body.type === "buyer") {
      let { fullname, email, password } = body;

      // confirm formats of inputs
      fullname = capitalize(fullname.trim());
      email = email.trim();

      const buyer = await Buyer.findOne({ email });

      // check if user already exists by username and email address

      if (buyer) {
        // return if user exists
        return res.status(400).json({
          message: `User with email '${email}' already exists.`,
        });
      }

      // create an object of the body entry
      const newBuyer = new Buyer({
        img: { public_id, url },
        fullname,
        email,
        password,
        store_id,
        store_name: shortname,
      });

      newBuyer.password = await bcryptPromise(newBuyer.password);

      await newBuyer.save();

      user = Object.create(newBuyer);
    } else if (body.type === "seller") {
      let {
        fullname,
        brand_name,
        username,
        brand_desc,
        whatsapp,
        email,
        password,
      } = body;

      // confirm formats of inputs
      fullname = capitalize(fullname.trim());
      brand_name = capitalize(brand_name.trim());
      // remove spaces - though this is handled in the client side already but just incase
      username = username.trim().replace(/\s/g, "").toLowerCase();
      email = email.trim();

      const seller = await Seller.findOne({ $or: [{ username }, { email }] });

      // check if user already exists by username and email address

      if (seller) {
        // return if user exists
        if (seller.username === username) {
          return res.status(400).json({
            message: `Seller with username '${username}' already exists.`,
          });
        }
        if (seller.email === email) {
          return res.status(400).json({
            message: `Seller with email '${email}' already exists.`,
          });
        }
      }

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

      user = Object.create(newSeller);
    }

    const generatedHash = randomNumber();

    const newEmailToBeConfirmed = new EmailConfirmation({
      generatedHash,
      // user_id would be sent with email, so that on verification, the email_confirm field would be true
      user_id: user._id,
      user_type: body.type,
    });

    await newEmailToBeConfirmed.save();

    const token = getToken({ _id: user._id });

    const sendEmailResponse = await sendEmailConfirmation({
      generatedHash,
      email: user.email,
      name: user.fullname,
      store: store_name,
      user_type: body.type,
      type: "welcome",
    });

    if (!sendEmailResponse.error) {
      // then the email went successfully
      res.json({
        token,
        message:
          "Account Created Successfully 💛. Please check your email to confirm your email address.",
      });
    } else {
      // well the seller was still saved even if email wasn't sent
      console.log(
        "Email confirmation couldn't be sent >> ",
        sendEmailResponse.error
      );
    }
  } catch (err) {
    console.log("An error occured during user creation >> ", err);
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

// Resend email confirmation link
router.post("/resend_confirmation_link", async (req: any, res: any) => {
  let { email, user_type } = req.body as {
    email: string;
    user_type: "seller" | "buyer";
  };

  email = email.trim();

  let user: BuyerInterface | SellerInterface | null = null;

  if (user_type === "buyer") {
    const buyer = await Buyer.findOne({ email });
    user = buyer ? Object.create(buyer) : null;
  } else if (user_type === "seller") {
    const seller = await Seller.findOne({ email });
    user = seller ? Object.create(seller) : null;
  }

  try {
    if (user === null) {
      // then email does not exist
      return res.status(400).json({
        error: "Unable to find email",
        message: `'${email}' was not the email you inserted during your registration process`,
      });
    }

    if (user.email_confirm === true) {
      return res.json({
        message: "Your email address has been confirmed already",
      });
    }

    const existingEmailConfirmation = await EmailConfirmation.findOne({
      user_id: user._id,
    });

    // TODO just incase the emailConfirmation document was not saved

    // if (existingEmailConfirmation === null) {
    //   // then an email confirmation document was not saved for this email, which is almost never possible
    //   const generatedHash = randomNumber();
    //   const newEmailToBeConfirmed = new EmailConfirmation({
    //     generatedHash,
    //     seller_id: seller._id,
    //   });

    //   await newEmailToBeConfirmed.save();

    if (!existingEmailConfirmation)
      return res.status(400).json({ message: "Confirmation hash not found" });

    const sendEmailResponse = await sendEmailConfirmation({
      generatedHash: existingEmailConfirmation.generatedHash,
      email: user.email,
      name: user.fullname,
      store: user.store_name,
      user_type,
    });

    if (!sendEmailResponse.error) {
      // then the email went successfully
      res.json({
        message:
          "Confirmation link sent 💛. Please check your email to confirm your email address then login",
      });
    } else {
      console.log(
        "Email confirmation could't be sent >> ",
        sendEmailResponse.error
      );
    }
  } catch (err) {
    console.log("An error occured while resending confirmation link >> ", err);
    res.status(500).json({
      error: err,
      message: "Error occured. Please try again",
    });
  }
});

// Reset password request
router.post("/reset_password", async (req: any, res: any) => {
  let { email, user_type } = req.body as {
    email: string;
    user_type: "buyer" | "seller";
  };

  email = email.trim();

  let user: BuyerInterface | SellerInterface | null = null;

  if (user_type === "buyer") {
    const buyer = await Buyer.findOne({ email });
    user = Object.create(buyer);
  } else if (user_type === "seller") {
    const seller = await Seller.findOne({ email });
    user = Object.create(seller);
  }

  try {
    if (user === null) {
      // then email does not exist
      return res.status(400).json({
        error: "Unable to find email",
        message: `'${email}' was not the email you inserted during your registration process`,
      });
    }

    const existingResetPassword = await ResetPassword.findOne({
      user_id: user._id,
    });

    let hash;

    if (existingResetPassword === null) {
      const generatedHash = randomNumber();
      const newPasswordReset = new ResetPassword({
        generatedHash,
        user_id: user._id,
      });

      await newPasswordReset.save();

      hash = generatedHash;
    }
    // then a password reset document was saved already
    else hash = existingResetPassword.generatedHash;

    const sendEmailResponse = await resetPassword({
      generatedHash: hash,
      email,
      name: user.fullname,
      store: user.store_name,
    });

    if (!sendEmailResponse.error) {
      // then the email went successfully
      res.json({
        message:
          "Password reset link sent 💛. Please check your email to reset your password",
      });
    } else {
      console.log(
        "Password reset could't be sent >> ",
        sendEmailResponse.error
      );
    }
  } catch (err) {
    console.log("An error occured while send password reset link >> ", err);
    res.status(500).json({
      error: err,
      message: "Error occured. Please try again",
    });
  }
});

router.get("/reset_password/:hash", async (req: any, res: any) => {
  const { user_type } = req.query as { user_type: "seller" | "buyer" };
  const hash = await ResetPassword.findOne({
    generatedHash: req.params.hash,
  });

  if (hash === null) {
    // then the hash does not exist
    return res.status(400).json({
      message: "invalid",
    });
  }

  let user: SellerInterface | BuyerInterface | null = null;

  if (user_type === "seller") {
    const seller = await Seller.findById(hash.user_id);
    user = seller ? Object.create(seller) : null;
  } else if (user_type === "buyer") {
    const buyer = await Buyer.findById(hash.user_id);
    user = buyer ? Object.create(buyer) : null;
  }

  if (!user)
    return res.status(400).json({
      message: "No user with that id",
    });

  const { generatedHash } = hash;

  res.redirect(
    `http://${seller.store_name}.skulmart.com/reset_password?hash=${generatedHash}`
  );
});

router.post("/reset_password/:hash", async (req: any, res: any) => {
  const { password, user_type } = req.body as {
    password: string;
    user_type: "buyer" | "seller";
  };

  const hash = await ResetPassword.findOne({
    generatedHash: req.params.hash,
  });

  if (hash === null) {
    // just incase the hash is tampared with
    res.status(404).json({
      message:
        "This password link is not correct. Check your email and click Reset for the correct link",
    });
    return;
  }

  let user: BuyerInterface | SellerInterface | null = null;

  if (user_type === "buyer") {
    const buyer = await Buyer.findById(hash.user_id);
    user = buyer ? Object.create(buyer) : null;
  } else if (user_type === "seller") {
    const seller = await Seller.findById(hash.user_id);
    user = seller ? Object.create(seller) : null;
  }

  if (!user) {
    res.status(404).json({
      message: `Your account does not exist. Please contact support`,
    });
    return;
  }

  try {
    await ResetPassword.findByIdAndDelete(hash._id);
  } catch (err) {
    console.log("Password reset hash could not be deleted >> ", err);
  }

  const newPassword = await bcryptPromise(password);

  if (user_type === "seller") {
    await Seller.findByIdAndUpdate(user._id, {
      $set: {
        password: newPassword,
      },
    });
  } else if (user_type === "buyer") {
    await Buyer.findByIdAndUpdate(user._id, {
      $set: {
        password: newPassword,
      },
    });
  }

  res.json({
    message: "Password reset complete",
  });
});

export default router;
