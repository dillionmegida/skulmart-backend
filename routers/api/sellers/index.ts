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
import SellerInterface from "interfaces/Seller";



/*
 *
 * PRIVATE ROUTES
 *
 */





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
