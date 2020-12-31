import express from "express";
const router = express.Router();


import Seller from "models/Seller";
import { getToken } from "utils/token";
import isAuthenticated from "middlewares/isAuthenticated";
import { capitalize, bcryptPromise, replaceString } from "utils/strings";
import sendEmailConfirmation from "mails/emailConfirmation";
import ResetPassword from "models/ResetPassword";
import resetPasswordEmail from "mails/resetPasswordEmail";
import confirmChangedEmail from "mails/confirmChangedEmail";
import welcomeEmail from "mails/welcomeEmail";

import multer from "multer";
import Store from "models/Store";
import { randomNumber } from "utils/numbers";
import EmailConfirmation from "models/EmailConfirmation";
import Buyer from "models/Buyer";
import BuyerInterface from "interfaces/Buyer";
import SellerInterface from "interfaces/Seller";
import Product from "models/Product";
import { FREE_PLAN } from "constants/subscriptionTypes";
import userTypeRequired from "middlewares/userTypeRequired";
import chalk from "chalk";
import { CLOUDINARY_USER_IMAGES_FOLDER, MERCHANT_SITE } from "constants/index";
import { deleteImage, uploadImage } from "utils/image";
import StoreInterface from "interfaces/Store";

var upload = multer({ dest: "uploads/" });



// Update seller email
router.post("/update/email", isAuthenticated, async (req: any, res: any) => {
  let { email, user_type } = req.body as {
    email: string;
    user_type: "seller" | "buyer";
  };

  email = email.trim();

  // check if user already exists
  const buyerWithSameEmail = await Buyer.findOne({ email });
  if (buyerWithSameEmail) {
    return res.status(400).json({
      message: `User with the email '${email}' already exists.`,
    });
  }

  const sellerWithSameEmail = await Seller.findOne({ email });
  if (sellerWithSameEmail) {
    return res.status(400).json({
      message: `User with the email '${email}' already exists.`,
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
      user_type,
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
        chalk.red(
          "Email confirmation during changing email process could't be sent >> ",
          sendEmailResponse.error
        )
      );
    }
  } catch (err) {
    console.log(
      chalk.red("Error sending email during changing email process >> ", err)
    );
    res.status(400).json({
      error: err,
      message: "Error occured. Please try again",
    });
  }
});

// Update user password
router.post("/update/password", isAuthenticated, async (req: any, res: any) => {
  const body = { ...req.body } as {
    old_password: string;
    new_password: string;
    user_type: "seller" | "buyer";
  };

  const { old_password, new_password, user_type } = body;

  const authUser = req.user;

  let user: BuyerInterface | SellerInterface | null = null;

  if (user_type === "seller") {
    user = await Seller.findOne({
      _id: authUser._id,
    });
  } else if (user_type === "buyer") {
    user = await Buyer.findOne({
      _id: authUser._id,
    });
  }

  if (!user)
    return res.status(400).json({
      message: "User not found",
    });

  // compare old password
  const isMatch = await bcrypt.compare(old_password, user.password);
  if (!isMatch) {
    // they they don't match
    return res.status(400).json({
      error: "Wrong credentials",
      message: "Old password is incorrect",
    });
  }
  try {
    const encryptedPassword = await bcryptPromise(new_password);

    if (user_type === "seller") {
      await Seller.findByIdAndUpdate(user._id, {
        $set: {
          password: encryptedPassword,
        },
      });
    } else if (user_type === "buyer") {
      await Buyer.findByIdAndUpdate(user._id, {
        $set: {
          password: encryptedPassword,
        },
      });
    }

    return res.json({
      message: "Successfully updated password",
    });
  } catch (err) {
    console.log(chalk.red("Error occurred during password update process >> "));
    res.status(400).json({
      error: err,
      message: "Error occured! Please try again.",
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

    await deleteImage({
      public_id: user.img.public_id,
      errorMsg: "Could not delete user image",
    });

    if (user.user_type === "seller") {
      const sellerProducts = await Product.find({ seller: req.user._id });

      // delete all seller's products from the db
      await Product.deleteMany({
        seller: req.user._id,
      });

      if (sellerProducts && sellerProducts.length > 0) {
        // delete all seller's products images
        for (let i = 0; i < sellerProducts.length; i++) {
          const product = sellerProducts[0];
          await deleteImage({
            public_id: product.img.public_id,
            errorMsg: "Could not delete product image",
          });
        }
      }

      await Seller.deleteOne({
        _id: user._id,
      });
    } else if (user.user_type === "buyer") {
      await Buyer.deleteOne({
        _id: user._id,
      });
    }

    res.json({
      message: "Successfully deleted user",
    });
  } catch (err) {
    console.log(chalk.red("Could not delete user >> ", err));
    return res.status(400).json({
      error: err,
      message: "No user with that id",
    });
  }
});

export default router;
