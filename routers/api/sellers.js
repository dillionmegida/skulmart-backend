const router = require("./auth");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const sendEmailConfirmation = require("../../mails/emailConfirmation");
const resetPassword = require("../../mails/resetPassword");
const confirmChangedEmail = require("../../mails/confirmChangedEmail");
const { capitalize, bcryptPromise } = require("../../functions/strings");
const { randomNumber } = require("../../functions/numbers");

const paystackKey = process.env.PAYSTACK_SECRET_KEY;

const paystack = require("paystack-api")(paystackKey);

const multer = require("multer");
var upload = multer({ dest: "uploads/" });

const { FREE_PLAN, SILVER_PLAN } = require("../../constants/subscriptionTypes");

const cloudinary = require("cloudinary").v2;

const Seller = require("../../models/Seller");
const Product = require("../../models/Product");
const Store = require("../../models/Store");
const EmailConfirmation = require("../../models/EmailConfirmation");
const ResetPassword = require("../../models/ResetPassword");
const isAuthenticated = require("../../middlewares/isAuthenticated");
const { getToken } = require("../../functions/token");
const SellerNotificationMessage = require("../../models/SellerNotificationMessage");
const getAuthUser = require("../../functions/getAuthUser");

/*
 *
 * PUBLIC ROUTES
 *
 */

router.get("/", async (req, res) => {
  const sellers = await Seller.find({
    store_id: req.store_id,
    email_confirm: true,
  }).select("-password");
  return res.json(sellers);
});

router.get("/:username", async (req, res) => {
  const seller = await Seller.findOne({
    username: req.params.username,
    store_id: req.store_id,
    subscription_type: { $ne: null },
  }).select("-password");
  if (seller === null) {
    // seller does not exist
    return res.status(404).json({
      error: "Username invalid",
      message: "No seller with that username",
    });
  }
  return res.json(seller);
});

router.get("/id/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const seller = await Seller.findOne({
      _id: id,
      store_id: req.store_id,
      subscription_type: { $ne: null },
    }).select("-password");
    res.json(seller);
  } catch {
    // then seller does not exist
    return res.status(404).json({
      error: "Invalid id",
      message: "No seller with that id exists",
    });
  }
});

router.get("/search/:query", async (req, res) => {
  // clear whitespaces (%20), change query to small letters, and test query with small letters
  let searchRegex = new RegExp(
    `${req.params.query.replace("%20", "").toLowerCase()}`,
    "ig"
  );
  try {
    const sellers = await Seller.find({ store_id: req.store_id });
    const filteredSellers = sellers.filter(
      (seller) =>
        searchRegex.test(seller.fullname) || searchRegex.test(seller.brand_name)
    );
    res.json(filteredSellers);
  } catch (err) {
    res.status(400).json({
      error: err,
      message: "No seller matched that query",
    });
  }
});

router.post("/", upload.single("avatar"), async (req, res) => {
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

    const { _id: store_id, shortname } = await Store.findOne({
      shortname: store_name.toLowerCase(),
    });

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

    const sendEmailResponse = await sendEmailConfirmation(
      generatedHash,
      email,
      fullname,
      store_name,
      "welcome"
    );

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

router.post("/resend_confirmation_link", async (req, res) => {
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

    const sendEmailResponse = await sendEmailConfirmation(
      existingEmailConfirmation.generatedHash,
      seller.email,
      seller.fullname
    );
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

router.post("/reset_password", async (req, res) => {
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

    const existingResetPassword = await ResetPassword.findOne({
      seller_id: seller._id,
    });

    let hash;

    if (existingResetPassword === null) {
      const generatedHash = randomNumber();
      const newPasswordReset = new ResetPassword({
        generatedHash,
        seller_id: seller._id,
      });

      await newPasswordReset.save();

      hash = generatedHash;
    }
    // then a password reset document was saved already
    else hash = existingResetPassword.generatedHash;

    const sendEmailResponse = await resetPassword(
      hash,
      email,
      seller.fullname,
      seller.store_name
    );
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

/*
 *
 * PRIVATE ROUTES
 *
 */

router.delete("/", isAuthenticated, async (req, res) => {
  try {
    const seller = await Seller.findOne({
      _id: req.seller._id,
      store_id: req.store_id,
    });

    await Product.deleteMany({
      seller_id: req.seller._id,
      store_id: req.store_id,
    });

    cloudinary.uploader.destroy(seller.img.public_id, (error) => {
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

router.post(
  "/update",
  isAuthenticated,
  upload.single("avatar"),
  async (req, res) => {
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
      await cloudinary.uploader.destroy(public_id, (error) => {
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

router.post("/update/email/", isAuthenticated, async (req, res) => {
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

  const sellerId = getAuthUser(req)._id;

  const existingSeller = await Seller.findOne({
    _id: sellerId,
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

    const sendEmailResponse = await confirmChangedEmail(
      generatedHash,
      email,
      existingSeller.fullname
    );

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

router.get("/subscription/initialize", isAuthenticated, (req, res) => {
  const { subscriptionType } = req.query;

  let price;
  if (subscriptionType === "silver") price = SILVER_PLAN.price;
  else if (subscriptionType === "gold") price = GOLD_PLAN.price;

  const helper = new paystack.FeeHelper();

  const amount = helper.addFeesTo(price);

  const seller = getAuthUser(req);

  paystack.transaction
    .initialize({
      amount,
      email: seller.email,
      metadata: {
        custom_fields: [{ subscription_type: subscriptionType }],
      },
    })
    .then(({ data: { authorization_url } }) => res.redirect(authorization_url));
});

router.get("/subscription/callback", async (req, res) => {
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

    let plan = null;
    if (subscription_type === "silver") {
      plan = { ...SILVER_PLAN };
    } else if (subscription_type === "gold") {
      plan = { ...GOLD_PLAN };
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

    const seller = getAuthUser(req);
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
        subscription_type: plan,
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

    const idsOfProductsToUpdate = [];

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
router.post("/subscription/activate", async (req, res) => {
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

// @title UPDATE request seller email
// @desc update seller password in mongoose document by id
// @access public

router.post("/update/password", isAuthenticated, async (req, res) => {
  const { old_password, new_password } = req.body;

  const authUser = getAuthUser(req);

  const seller = await Seller.findOne({
    _id: authUser._id,
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

router.get("/notifications/all", isAuthenticated, async (req, res) => {
  const allNotifications = await SellerNotificationMessage.find();

  const sellerId = getAuthUser(req)._id;
  const unreadNotifications = allNotifications.filter((n) => {
    return !n.viewedIds.includes(sellerId);
  });
  res.json(unreadNotifications);
});

router.get("/notifications/:id", isAuthenticated, async (req, res) => {
  const { id = null } = req.params;

  const sellerId = getAuthUser(req)._id;
  if (id) {
    try {
      const notification = await SellerNotificationMessage.findById(id);
      const viewedIds = notification.viewedIds.includes(sellerId)
        ? [...notification.viewedIds]
        : [...notification.viewedIds].concat(sellerId);
      await SellerNotificationMessage.findByIdAndUpdate(id, {
        $set: {
          viewedIds: [...viewedIds],
        },
      });
      return res.json({
        message: "",
      });
    } catch (err) {
      console.log("Error occurred during reading notification >> ");
      res.status(400).json({
        error: err,
        message: "Error occured! Please try again.",
      });
    }
  }
});

module.exports = router;
