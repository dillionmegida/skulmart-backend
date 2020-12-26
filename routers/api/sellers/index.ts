import express from "express";
const router = express.Router();

const paystackKey = process.env.PAYSTACK_SECRET_KEY;

//@ts-ignore
import _paystack from "paystack-api";
const paystack = _paystack(paystackKey);

import { FREE_PLAN, SILVER_PLAN } from "constants/subscriptionTypes";

import Seller from "models/Seller";
import Product from "models/Product";
import isAuthenticated from "middlewares/isAuthenticated";
import SellerNotificationMessage from "models/SellerNotificationMessage";
import { SELLERS_PER_PAGE, PRODUCTS_PER_PAGE } from "constants/index";

/*
 *
 * PUBLIC ROUTES
 *
 */

// Get all sellers in a store
router.get("/", async (req: any, res: any) => {
  const { page: _page = 0 } = req.query;
  const criteria = {
    store_id: req.store_id,
    email_confirm: true,
  };
  const page = parseInt(_page);
  const totalCount = await Seller.countDocuments({ ...criteria });
  const sellers = await Seller.find({
    ...criteria,
  })
    .select("-password")
    .limit(SELLERS_PER_PAGE)
    .skip(page * SELLERS_PER_PAGE);

  const totalPages = Math.ceil(totalCount / SELLERS_PER_PAGE) - 1; // since pages start from 0;

  return res.json({ sellers, totalPages });
});

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
  //   const sellerId = req.user._id;

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

// Get notification
router.get(
  "/notifications/:id",
  isAuthenticated,
  async (req: any, res: any) => {
    const { id = null } = req.params;

    const sellerId = req.user._id;
    if (id) {
      try {
        const notification = await SellerNotificationMessage.findById(id);

        if (!notification)
          return res.status(400).json({ message: "Notification not found" });

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
  }
);

export default router;
