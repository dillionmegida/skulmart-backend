import express from "express";
const router = express.Router();
import bcrypt from "bcryptjs";
import sendEmailConfirmation from "mails/emailConfirmation";
import resetPassword from "mails/resetPassword";
import confirmChangedEmail from "mails/confirmChangedEmail";
import { capitalize, bcryptPromise } from "utils/strings";
import { randomNumber } from "utils/numbers";

const paystackKey = process.env.PAYSTACK_SECRET_KEY;

//@ts-ignore
import _paystack from "paystack-api";
const paystack = _paystack(paystackKey);

import multer from "multer";
var upload = multer({ dest: "uploads/" });

import { FREE_PLAN, SILVER_PLAN } from "constants/subscriptionTypes";

import { v2 as cloudinary } from "cloudinary";

import Seller from "models/Seller";
import Product from "models/Product";
import Store from "models/Store";
import EmailConfirmation from "models/EmailConfirmation";
import ResetPassword from "models/ResetPassword";
import isAuthenticated from "middlewares/isAuthenticated";
import { getToken } from "utils/token";
import SellerNotificationMessage from "models/SellerNotificationMessage";
import { SELLERS_PER_PAGE, PRODUCTS_PER_PAGE } from "constants/index";

/*
 *
 * PUBLIC ROUTES
 *
 */

// Get seller by username
router.get("/:username", async (req: any, res: any) => {
  const seller = await Seller.findOne({
    username: req.params.username,
    store_id: req.store_id,
    subscription_type: { $ne: undefined },
  }).select("-password");
  if (seller === null) {
    // seller does not exist
    return res.status(404).json({
      error: "Username invalid",
      message: "No seller with that username",
    });
  }
  const totalProducts = await Product.countDocuments({
    store_id: req.store_id,
    visible: true,
    seller_id: seller._id,
  });
  return res.json({ seller, totalProducts });
});

// Get seller by id
router.get("/id/:id", async (req: any, res: any) => {
  const id = req.params.id;
  try {
    const seller = await Seller.findOne({
      _id: id,
      store_id: req.store_id,
      subscription_type: { $ne: undefined },
    }).select("-password");
    res.json({ seller });
  } catch {
    // then seller does not exist
    return res.status(404).json({
      error: "Invalid id",
      message: "No seller with that id exists",
    });
  }
});

// Get sellers by query
router.get("/search/query", async (req: any, res: any) => {
  const { q = null, page: _page } = req.query;
  let searchRegex = new RegExp(`${q.replace("%20", "").toLowerCase()}`, "ig");
  const criteria = {
    store_id: req.store_id,
    email_confirm: true,
    $or: [
      {
        fullname: { $regex: searchRegex },
      },
      {
        brand_name: { $regex: searchRegex },
      },
    ],
  };
  const page = parseInt(_page);
  const totalCount = await Seller.countDocuments({ ...criteria });
  // clear whitespaces (%20), change query to small letters, and test query with small letters
  try {
    const sellers = await Seller.find({ ...criteria })
      .limit(SELLERS_PER_PAGE)
      .skip(page * SELLERS_PER_PAGE);
    const totalPages = Math.ceil(totalCount / SELLERS_PER_PAGE) - 1; // since pages start from 0;;
    res.json({ sellers, totalPages });
  } catch (err) {
    res.status(400).json({
      error: err,
      message: "No seller matched that query",
    });
  }
});

// Create new seller
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

    // check if seller already exists by username and email address
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

// Resend email confirmation link
router.post("/resend_confirmation_link", async (req: any, res: any) => {
  let { email } = req.body;
  email = email.trim();

  const seller = await Seller.findOne({ email });

  try {
    if (seller === null) {
      // then email does not exist
      return res.status(400).json({
        error: "Unable to find email",
        message: `'${email}' was not the email you inserted during your registration process`,
      });
    }

    if (seller.email_confirm === true) {
      return res.json({
        message: "Your email address has been confirmed already",
      });
    }

    const existingEmailConfirmation = await EmailConfirmation.findOne({
      seller_id: seller._id,
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
      email: seller.email,
      name: seller.fullname,
      store: seller.store_name,
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

/*
 *
 * PRIVATE ROUTES
 *
 */

// Get all products of logged in seller
router.get("/products/all", isAuthenticated, async (req: any, res: any) => {
  try {
    const { page: _page } = req.query;
    const page = parseInt(_page);

    const criteria = {
      store_id: req.store_id,
      visible: true,
      seller_id: req.user._id,
    };

    const totalCount = await Product.countDocuments({ ...criteria });
    const totalPages = Math.ceil(totalCount / PRODUCTS_PER_PAGE) - 1; // since pages start from 0;

    const products = await Product.find({
      ...criteria,
    })
      .limit(PRODUCTS_PER_PAGE)
      .skip(page * PRODUCTS_PER_PAGE);

    res.json({ products, totalPages });
  } catch (err) {
    res.status(404).json({
      error: err,
      message: "Error. Coudn't load products",
    });
  }
});

// Delete seller
router.delete("/", isAuthenticated, async (req: any, res: any) => {
  try {
    const seller = await Seller.findOne({
      _id: req.seller._id,
      store_id: req.store_id,
    });

    if (!seller)
      return res.status(400).json({
        message: "Seller not found",
      });

    await Product.deleteMany({
      seller_id: req.seller._id,
      store_id: req.store_id,
    });

    cloudinary.uploader.destroy(seller.img.public_id, (error: any) => {
      if (error) {
        console.log("Could not delete seller image >> ", error);
      }
    });

    await Seller.deleteOne({
      _id: seller._id,
    });

    res.json({
      message: "Successfully deleted user",
    });
  } catch (err) {
    console.log("Could not delete seller >> ", err);
    return res.status(400).json({
      error: err,
      message: "No seller with that id",
    });
  }
});

// Update seller
router.post(
  "/update",
  isAuthenticated,
  upload.single("avatar"),
  async (req: any, res: any) => {
    let {
      fullname,
      brand_name,
      username,
      brand_desc,
      whatsapp,
      img_public_id,
      img_url,
    } = req.body;

    fullname = capitalize(fullname.trim());
    brand_name = capitalize(brand_name.trim());
    // remove spaces - though this is handled in the client side already but just incase
    username = username.trim().replace(/\s/g, "").toLowerCase();

    const existingSeller = await Seller.findOne({
      username,
      _id: req.seller_id,
    });

    if (existingSeller && existingSeller._id !== req.seller._id) {
      // then there is an seller product with the name
      return res.status(400).json({
        message: `Seller with the username '${username}' already exists`,
      });
    }

    // former image details
    let public_id = img_public_id;
    let url = img_url;

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

    try {
      await Seller.findOneAndUpdate(
        { _id: req.seller._id, store_id: req.store_id },
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
      return res.json({
        message: "Updated account successfully",
      });
    } catch (err) {
      res.status(400).json({
        error: err,
        message: "No seller with that id",
      });
    }
  }
);

// Update seller email
router.post("/update/email/", isAuthenticated, async (req: any, res: any) => {
  let { email } = req.body;
  email = email.trim();

  const existingSellerEmail = await Seller.findOne({
    email,
  });

  if (existingSellerEmail !== null) {
    // that means the new email used has been registered already
    return res.status(400).json({
      message: `Seller with the email '${email}' already exists`,
    });
  }

  const sellerId = req.user._id;

  const existingSeller = await Seller.findOne({
    _id: sellerId,
  });

  if (!existingSeller)
    return res.status(400).json({
      message: "Seller not found",
    });

  try {
    await Seller.findByIdAndUpdate(sellerId, {
      $set: {
        email,
        email_confirm: false,
      },
    });

    const generatedHash = randomNumber();

    const newEmailToBeConfirmed = new EmailConfirmation({
      generatedHash,
      seller_id: sellerId,
    });

    await newEmailToBeConfirmed.save();

    const sendEmailResponse = await confirmChangedEmail({
      generatedHash,
      email,
      name: existingSeller.fullname,
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

router.get(
  "/subscription/initialize",
  isAuthenticated,
  (req: any, res: any) => {
    const { subscriptionType } = req.query;

    let price;
    if (subscriptionType === "silver") price = SILVER_PLAN.price;
    else subscriptionType === "free";

    const helper = new paystack.FeeHelper();

    const amount = helper.addFeesTo(price);

    const seller = req.user;

    type PaystackResponse = {
      data: {
        authorization_url: string;
      };
    };

    paystack.transaction
      .initialize({
        amount,
        email: seller.email,
        metadata: {
          custom_fields: [{ subscription_type: subscriptionType }],
        },
      })
      .then(({ data: { authorization_url } }: PaystackResponse) =>
        res.redirect(authorization_url)
      );
  }
);

router.get("/subscription/callback", async (req: any, res: any) => {
  const { reference } = req.query;

  try {
    const {
      status,
      data: {
        paid_at,
        customer: { email },
        metadata: { custom_fields },
      },
    } = await paystack.transaction.verify({ reference });

    if (status === false) {
      return res.json({
        message: "Transaction status is failed",
      });
    }

    const { subscription_type } = custom_fields[0];

    let plan = { ...FREE_PLAN };
    if (subscription_type === "silver") {
      plan = { ...SILVER_PLAN };
    }

    if (plan === null) {
      res.status(400).json({
        message: "Plan does not exist",
      });
      return;
    }

    const paidDate = new Date(paid_at);
    const endDate = new Date(paid_at).setMonth(paidDate.getMonth() + 1);

    let sellerId, subscriptionReference;

    const seller = req.user;
    if (seller) {
      // which is expected
      sellerId = seller._id;
      subscriptionReference = seller.subscription_reference;
    } else {
      // just in case
      const seller = await Seller.findOne({
        email,
      }).select("_id subscription_reference");

      if (seller === null) {
        res.redirect("https://google.com");
        return;
      }

      sellerId = seller._id;
      subscriptionReference = seller.subscription_reference;
    }

    if (reference === subscriptionReference) {
      // so that on refresh, this url does not reset
      // the subscription properties
      res.redirect("https://skulmart.com");
      return;
    }

    await Seller.findByIdAndUpdate(sellerId, {
      $set: {
        subscription_type: plan.name,
        subscription_start_date: paidDate,
        subscription_end_date: endDate,
        subscription_reference: reference,
      },
    });

    const idsOfProducts = await Product.find({
      seller_id: sellerId,
    })
      .limit(plan.max_products)
      .select("_id");

    const idsOfProductsToUpdate: string[] = [];

    idsOfProducts.forEach(({ _id }) => idsOfProductsToUpdate.push(_id));

    await Product.updateMany(
      { _id: { $in: idsOfProductsToUpdate } },
      {
        $set: {
          visible: true,
        },
      }
    );

    if (seller) {
      // then the seller is logged in
      // useful to redirect the seller to the store site
      const { store_name } = seller;
      res.redirect(
        `http://${store_name}.skulmart.com/dashboard?subscriptionStatus=success`
      );
    } else {
      // very unlikely
      res.redirect("http://skulmart.com");
    }
  } catch (err) {
    console.log("Unable to verify transaction reference because: ", err);
    return res.json({
      message: "Unable to verify transaction reference",
    });
  }
});

// paystack hits the path when a seller pays
router.post("/subscription/activate", async (req: any, res: any) => {
  const { body, headers } = req;
  console.log({ body });
  // return;
  // const store = body.store;
  // var hash = crypto
  //   .createHmac("sha512", paystackKey)
  //   .update(JSON.stringify(body))
  //   .digest("hex");
  // if (hash !== headers["x-paystack-signature"])
  //   // then webhook was not called from paystack
  //   return res.status(400).json({
  //     message: "Error occured. Please try again",
  //   });

  // const { type } = req.body;

  // try {
  //   const sellerId = req.seller._id;

  //   let subscriptionType;

  //   if (type === "silver") subscriptionType = { ...SILVER_PLAN };
  //   else if (type === "gold") subscriptionType = { ...GOLD_PLAN };
  //   else
  //     res.status(400).json({
  //       message: "Plan does not exist",
  //     });

  //   const currentDate = new Date();

  //   const oneMonthFromNow = new Date().setMonth(currentDate.getMonth() + 1);

  //   await Seller.findByIdAndUpdate(sellerId, {
  //     $set: {
  //       subscription_type: subscriptionType,
  //       subscribed_start_date: currentDate,
  //       subscribed_end_date: oneMonthFromNow,
  //     },
  //   });

  //   res.redirect(
  //     200,
  //     `http://${store}.skulmart.com/subscription/successful?type=${subscriptionType}`
  //   );
  // } catch (err) {
  //   res.status(404).json({
  //     error: err,
  //     message: "Unable to subscribe",
  //   });
  // }
});

// Update seller password
router.post("/update/password", isAuthenticated, async (req: any, res: any) => {
  const { old_password, new_password } = req.body;

  const authUser = req.user;

  const seller = await Seller.findOne({
    _id: authUser._id,
  });

  if (!seller)
    return res.status(400).json({
      message: "Seller not found",
    });

  // compare old password
  const isMatch = await bcrypt.compare(old_password, seller.password);
  if (!isMatch) {
    // they they don't match
    return res.status(400).json({
      error: "Wrong credentials",
      message: "Old password is incorrect",
    });
  }
  try {
    const encryptedPassword = await bcryptPromise(new_password);

    await Seller.findByIdAndUpdate(seller._id, {
      $set: {
        password: encryptedPassword,
      },
    });

    return res.json({
      message: "Successfully updated password",
    });
  } catch (err) {
    console.log("Error occurred during password update process >> ");
    res.status(400).json({
      error: err,
      message: "Error occured! Please try again.",
    });
  }
});

// Get all notifications for seller
router.get(
  "/notifications/all",
  isAuthenticated,
  async (req: any, res: any) => {
    const allNotifications = await SellerNotificationMessage.find();

    const sellerId = req.user._id;
    const unreadNotifications = allNotifications.filter((n) => {
      return !n.viewedIds.includes(sellerId);
    });
    res.json({ notifications: unreadNotifications });
  }
);

export default router;
