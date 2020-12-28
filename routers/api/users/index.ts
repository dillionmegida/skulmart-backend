import express from "express";
const router = express.Router();

import bcrypt from "bcryptjs";

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
import { CLOUDINARY_USER_IMAGES_FOLDER } from "constants/index";
import { deleteImage, uploadImage } from "utils/image";

var upload = multer({ dest: "uploads/" });

// Get authenticated user
router.get("/me", isAuthenticated, async (req: any, res: any) => {
  res.json(req.user);
});

// Create new user
router.post(
  "/",
  upload.single("avatar"),
  userTypeRequired,
  async (req: any, res: any) => {
    const body: SellerInterface | BuyerInterface = { ...req.body };

    const { email } = body;

    try {
      const { store_name } = req;

      const store = await Store.findOne({
        shortname: store_name.toLowerCase(),
      });

      if (!store)
        return res.status(400).json({
          message: "Store does not exist",
        });

      const { _id: store_id, shortname } = store;

      // check if user already exists
      const buyer = await Buyer.findOne({ email });
      if (buyer) {
        // return if user exists
        return res.status(400).json({
          message: `User with email '${email}' already exists.`,
        });
      }

      const seller = await Seller.findOne({ email });
      if (seller) {
        // return if user exists
        return res.status(400).json({
          message: `User with email '${email}' already exists.`,
        });
      }

      if (body.user_type === "seller") {
        const sellerWithSameUsername = await Seller.findOne({
          username: body.username,
        });

        // check if user already exists by username and email address
        if (sellerWithSameUsername) {
          // return if user exists
          return res.status(400).json({
            message: `Seller with username '${body.username}' already exists.`,
          });
        }
      }

      let user = null;

      const result = await uploadImage({
        path: req.file.path,
        filename: replaceString({
          str: body.fullname,
          replace: " ",
          _with: "-",
        }).toLowerCase(),
        folder: CLOUDINARY_USER_IMAGES_FOLDER,
      });

      if (result.error)
        return res.status(400).json({
          error: "Upload failed. Please try again",
        });

      const { public_id, url } = result;

      if (body.user_type === "buyer") {
        let { fullname, email, password } = body;

        // confirm formats of inputs
        fullname = capitalize(fullname.trim());
        email = email.trim();

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
      } else if (body.user_type === "seller") {
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
        user_type: body.user_type,
      });

      await newEmailToBeConfirmed.save();

      const token = getToken({ _id: user._id });

      const sendEmailResponse = await sendEmailConfirmation({
        generatedHash,
        email: user.email,
        name: user.fullname,
        store: store_name,
        user_type: body.user_type,
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
          chalk.red(
            "Email confirmation couldn't be sent >> ",
            sendEmailResponse.error
          )
        );
      }
    } catch (err) {
      console.log(chalk.red("An error occured during user creation >> ", err));
      res.status(500).json({
        error: err,
        message: "Error occured. Please try again",
      });
    }
  }
);

// Update user
router.post(
  "/update",
  isAuthenticated,
  upload.single("avatar"),
  userTypeRequired,
  async (req: any, res: any) => {
    const body = { ...req.body } as
      | (BuyerInterface & {
          img_public_id: string;
          img_url: string;
        })
      | (SellerInterface & {
          img_public_id: string;
          img_url: string;
        });

    try {
      const { store_name } = req;

      const store = await Store.findOne({
        shortname: store_name.toLowerCase(),
      });

      if (!store)
        return res.status(400).json({
          message: "Store does not exist",
        });

      // former image details
      let public_id = body.img_public_id as any;
      let url = body.img_url as any;

      if (req.file !== undefined) {
        // then a new image was selected

        // delete the previous image stored
        await deleteImage({
          public_id,
          errorMsg: "Previous image could not be deleted",
        });

        const result = await uploadImage({
          path: req.file.path,
          filename: replaceString({
            str: body.fullname,
            replace: " ",
            _with: "-",
          }).toLowerCase(),
          folder: CLOUDINARY_USER_IMAGES_FOLDER,
        });

        if (result.error)
          return res.status(400).json({
            error: "Upload failed. Please try again",
          });

        // change image details to the new image
        public_id = result.public_id;
        url = result.url;
      }

      if (body.user_type === "seller") {
        let { fullname, brand_name, username, brand_desc, whatsapp } = body;

        const existingUser = await Seller.findOne({
          username,
          _id: req.user._id,
        });

        if (
          existingUser &&
          existingUser._id.toString() !== req.user._id.toString()
        ) {
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
      } else if (body.user_type === "buyer") {
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
      console.log(chalk.red("Error updating user info >> ", err));
      res.status(400).json({
        error: err,
        message: "No user with that id",
      });
    }
  }
);

// Email confirmation
router.get("/confirm_email/:hash", async (req: any, res: any) => {
  console.log("yo");
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
      console.log(
        chalk.red("Confirmed email hash could not be deleted >> ", err)
      );
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
        console.log(chalk.red(sendEmailResponse.error));
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
      message: "User's email address could not be verified",
    });
  }
});

// used userTypeRequired manually in the above requests because
// req.body will return an empty object is multer does not do its work
router.use(userTypeRequired);

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

// Resend email confirmation link
router.post("/resend_confirmation_link", async (req: any, res: any) => {
  let { email, user_type } = req.body as {
    email: string;
    user_type: "seller" | "buyer";
  };

  email = email.trim();

  let user: BuyerInterface | SellerInterface | null = null;

  if (user_type === "buyer") {
    user = await Buyer.findOne({ email });
  } else if (user_type === "seller") {
    user = await Seller.findOne({ email });
  }

  try {
    if (!user) {
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

    let existingEmailConfirmation = await EmailConfirmation.findOne({
      user_id: user._id as any,
    });

    // incase the emailConfirmation document was not saved in the db during registration

    if (existingEmailConfirmation === null) {
      // then an email confirmation document was not saved for this email, which is almost never possible
      const generatedHash = randomNumber();
      const newEmailToBeConfirmed = new EmailConfirmation({
        generatedHash,
        user_id: user._id,
        user_type,
      });
      await newEmailToBeConfirmed.save();

      existingEmailConfirmation = newEmailToBeConfirmed;
    }

    const sendEmailResponse = await sendEmailConfirmation({
      generatedHash: existingEmailConfirmation?.generatedHash,
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
        chalk.red(
          "Email confirmation could't be sent >> ",
          sendEmailResponse.error
        )
      );
    }
  } catch (err) {
    console.log(
      chalk.red("An error occured while resending confirmation link >> ", err)
    );
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
    user = await Buyer.findOne({ email });
  } else if (user_type === "seller") {
    user = await Seller.findOne({ email });
  }

  try {
    if (!user) {
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
        chalk.red("Password reset could't be sent >> ", sendEmailResponse.error)
      );
    }
  } catch (err) {
    console.log(
      chalk.red("An error occured while send password reset link >> ", err)
    );
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
    console.log(chalk.red("Password reset hash could not be deleted >> ", err));
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
      const sellerProducts = await Product.find({ seller_id: req.user._id });

      // delete all seller's products from the db
      await Product.deleteMany({
        seller_id: req.user._id,
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
