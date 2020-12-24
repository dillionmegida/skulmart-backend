import express from "express";
const router = express.Router();

import bcrypt from "bcryptjs";

import Seller from "models/Seller";
import { getToken } from "utils/token";
import isAuthenticated from "middlewares/isAuthenticated";
import { capitalize, bcryptPromise } from "utils/strings";
import sendEmailConfirmation from "mails/emailConfirmation";
import ResetPassword from "models/ResetPassword";
import resetPasswordEmail from "mails/resetPasswordEmail";
import confirmChangedEmail from "mails/confirmChangedEmail";
import welcomeEmail from "mails/welcomeEmail";


import { v2 as cloudinary } from "cloudinary";

import multer from "multer";
import Store from "models/Store";
import { randomNumber } from "utils/numbers";
import EmailConfirmation from "models/EmailConfirmation";
import Buyer from "models/Buyer";
import BuyerInterface from "interfaces/Buyer";
import SellerInterface from "interfaces/Seller";
import Product from "models/Product";
import { FREE_PLAN } from "constants/subscriptionTypes";

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
  let { usernameOrEmail, password, user_type } = req.body as {
    usernameOrEmail: string;
    password: string;
    user_type: "buyer" | "seller";
  };

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

  const token = getToken({ _id: user._id, user_type });

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

    const sendEmailResponse = await resetPasswordEmail({
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

// I don't know why get /reset_password/:hash exists, but if I discover I don't need it,
// I'll delete
// router.get("/reset_password/:hash", async (req: any, res: any) => {
//   const { user_type } = req.query as { user_type: "seller" | "buyer" };
//   const hash = await ResetPassword.findOne({
//     generatedHash: req.params.hash,
//   });

//   if (hash === null) {
//     // then the hash does not exist
//     return res.status(400).json({
//       message: "invalid",
//     });
//   }

//   let user: SellerInterface | BuyerInterface | null = null;

//   if (user_type === "seller") {
//     const seller = await Seller.findById(hash.user_id);
//     user = seller ? Object.create(seller) : null;
//   } else if (user_type === "buyer") {
//     const buyer = await Buyer.findById(hash.user_id);
//     user = buyer ? Object.create(buyer) : null;
//   }

//   if (!user)
//     return res.status(400).json({
//       message: "No user with that id",
//     });

//   const { generatedHash } = hash;

//   const redirectTo = `http://${user.store_name}.skulmart.com/reset_password?hash=${generatedHash}`;

//   return {
//     redirectTo,
//   };
// });

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

// Update user
router.post(
  "/update",
  isAuthenticated,
  upload.single("avatar"),
  async (req: any, res: any) => {
    const body = { ...req.body } as
      | (BuyerInterface & { img_public_id: string; img_url: string })
      | (SellerInterface & { img_public_id: string; img_url: string });

    try {
      let { store_name } = body;

      const store = await Store.findOne({
        shortname: store_name.toLowerCase(),
      });

      if (!store)
        return res.status(400).json({
          message: "Store does not exist",
        });

      if (body.type !== "seller" && body.type !== "buyer")
        return res.status(400).json({ message: "User type not specified" });

      // former image details
      let public_id = body.img_public_id as any;
      let url = body.img_url as any;

      if (req.file !== undefined) {
        // then a new image was selected

        // delete the previous image stored
        await cloudinary.uploader.destroy(public_id, (error: any) => {
          if (error) {
            // then previous image was not deleted
            console.log("Previous image could not be deleted >> ", error);
            // still continue the update process, even if image was not deleted
          }
        });

        const result = await cloudinary.uploader.upload(req.file.path, {
          public_id: req.file.filename,
          folder: "market-hub/user_images",
        });

        // change image details to the new image
        public_id = result.public_id;
        url = result.url;
      }

      if (body.type === "seller") {
        let { fullname, brand_name, username, brand_desc, whatsapp } = body;

        const existingUser = await Seller.findOne({
          username,
          _id: req.user._id,
        });

        if (existingUser && existingUser._id !== req.user._id) {
          // then there is an seller with the name
          return res.status(400).json({
            message: `Seller with the username '${username}' already exists`,
          });
        }

        fullname = capitalize(fullname.trim());
        brand_name = capitalize(brand_name.trim());
        // remove spaces - though this is handled in the client side already but just incase
        username = username.trim().replace(/\s/g, "").toLowerCase();

        await Seller.findOneAndUpdate(
          { _id: req.user._id, store_id: req.store_id },
          {
            $set: {
              img: {
                public_id,
                url,
              },
              fullname,
              brand_name,
              username,
              brand_desc,
              whatsapp,
            },
          }
        );
      } else if (body.type === "buyer") {
        let { fullname } = body;

        fullname = capitalize(fullname.trim());

        await Buyer.findOneAndUpdate(
          { _id: req.user._id, store_id: req.store_id },
          {
            $set: {
              img: {
                public_id,
                url,
              },
              fullname,
            },
          }
        );
      }
      return res.json({
        message: "Updated account successfully",
      });
    } catch (err) {
      res.status(400).json({
        error: err,
        message: "No user with that id",
      });
    }
  }
);

// Update seller email
router.post("/update/email", isAuthenticated, async (req: any, res: any) => {
  let { email, user_type } = req.body as {
    email: string;
    user_type: "seller" | "buyer";
  };
  email = email.trim();

  let existingUserEmail: SellerInterface | BuyerInterface | null = null;

  if (user_type !== "seller" && user_type !== "buyer")
    return res.status(400).json({
      message: "User type not specified",
    });

  if (user_type === "seller") {
    existingUserEmail = await Seller.findOne({
      email,
    });
  } else if (user_type === "buyer") {
    existingUserEmail = await Buyer.findOne({
      email,
    });
  }

  if (existingUserEmail !== null) {
    // that means the new email used has been registered already
    return res.status(400).json({
      message: `User with the email '${email}' already exists`,
    });
  }

  const userId = req.user._id;

  let existingUser: BuyerInterface | SellerInterface | null = null;

  if (user_type === "seller") {
    existingUser = await Seller.findOne({
      _id: userId,
    });
  } else if (user_type === "buyer") {
    existingUser = await Buyer.findOne({
      _id: userId,
    });
  }

  if (!existingUser)
    return res.status(400).json({
      message: "User not found",
    });

  if (user_type === "seller") {
    await Seller.findByIdAndUpdate(userId, {
      $set: {
        email,
        email_confirm: false,
      },
    });
  } else if (user_type === "buyer") {
    await Buyer.findByIdAndUpdate(userId, {
      $set: {
        email,
        email_confirm: false,
      },
    });
  }

  try {
    const generatedHash = randomNumber();

    const newEmailToBeConfirmed = new EmailConfirmation({
      generatedHash,
      user_id: userId,
    });

    await newEmailToBeConfirmed.save();

    const sendEmailResponse = await confirmChangedEmail({
      generatedHash,
      email,
      name: existingUser.fullname,
    });

    if (!sendEmailResponse.error) {
      // then the email went successfully
      res.json({
        message:
          "Email changed Successfully 💛. Please check your email to confirm your new email address then login",
      });
    } else {
      // well the seller was still saved even if email wasn't sent
      console.log(
        "Email confirmation during changing email process could't be sent >> ",
        sendEmailResponse.error
      );
    }
  } catch (err) {
    console.log("Error sending email during changing email process >> ", err);
    res.status(400).json({
      error: err,
      message: "Error occured. Please try again",
    });
  }
});

// Delete user
router.delete("/", isAuthenticated, async (req: any, res: any) => {
  try {
    const user: BuyerInterface | SellerInterface = Object.create(req.user);

    if (!user)
      return res.status(400).json({
        message: "User not found",
      });

    // delete saved profile picture
    cloudinary.uploader.destroy(user.img.public_id, (error: any) => {
      if (error) {
        console.log("Could not delete user image >> ", error);
      }
    });

    if (user.type === "seller") {
      await Product.deleteMany({
        seller_id: user._id,
        store_id: req.store_id,
      });

      await Seller.deleteOne({
        _id: user._id,
      });
    } else if (user.type === "buyer") {
      await Buyer.deleteOne({
        _id: user._id,
      });
    }

    res.json({
      message: "Successfully deleted user",
    });
  } catch (err) {
    console.log("Could not delete user >> ", err);
    return res.status(400).json({
      error: err,
      message: "No user with that id",
    });
  }
});

// Email confirmation
router.get("/confirm_email/:hash", async (req: any, res: any) => {
  const { type: typeOfEmailConfirmation = "" } = req.query;
  const hash = await EmailConfirmation.findOne({
    generatedHash: req.params.hash,
  });

  if (hash === null) {
    // then the hash does not exist
    return res.json({
      error: true,
      message: "Link has expired",
    });
  }

  const { user_id, user_type } = hash;

  let updateEmailStatus = null;

  if (user_type === "buyer") {
    updateEmailStatus = await Buyer.findByIdAndUpdate(user_id, {
      $set: {
        email_confirm: true,
      },
    });
  } else if (user_type === "seller") {
    updateEmailStatus = await Seller.findByIdAndUpdate(user_id, {
      $set: {
        email_confirm: true,
        subscription_type: FREE_PLAN.name,
      },
    });
  }

  if (updateEmailStatus) {
    // then email has been confirmed
    // delete the hash collection from database
    try {
      await EmailConfirmation.findByIdAndDelete(hash._id);
    } catch (err) {
      console.log("Confirmed email hash could not be deleted >> ", err);
    }

    // get user details
    let confirmedUser = null;

    if (user_type === "seller") {
      confirmedUser = await Seller.findById(user_id);
    } else if (user_type === "buyer") {
      confirmedUser = await Buyer.findById(user_id);
    }

    if (!confirmedUser)
      return res.status(404).json({ message: "User not found" });

    const store = await Store.findById(confirmedUser.store_id);

    if (!store)
      return res.status(404).json({ message: "Store of user not found" });

    if (typeOfEmailConfirmation === "welcome") {
      const sendEmailResponse = await welcomeEmail({
        email: confirmedUser.email,
        name: confirmedUser.fullname,
        store: store.shortname,
      });

      if (sendEmailResponse.error) {
        // then the email didn't go successfully
        console.log(sendEmailResponse.error);
      }
    }

    // whether a welcome email is able to be sent or not, redirect to email_confirmed
    // because seller email has already been confirmed
    res.json({
      redirectTo: `http://${store.shortname}.skulmart.com/email_confirmed?email=${confirmedUser.email}`,
    });
  } else {
    res.json(400).json({
      error: "Could not verify email",
      message: "Seller's email address could not be verified",
    });
  }
});

export default router;
