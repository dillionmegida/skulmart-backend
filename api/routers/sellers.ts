import {
  getAllSellers,
  getAuthSellerProducts,
  getNotification,
  getNotifications,
  getSellerById,
  getSellerBySearch,
  getSellerByUsername,
  initializeSubscription,
  subscriptionCallback,
} from "api/controllers/sellers";
import express from "express";
const router = express.Router();
import isAuthenticated from "middlewares/isAuthenticated";

// Get all sellers in a store
router.get("/", getAllSellers);

// Get seller by username
router.get("/:username", getSellerByUsername);

// Get seller by id
router.get("/id/:id", getSellerById);

// Get sellers by query
router.get("/search/query", getSellerBySearch);

// Get all products of logged in seller
router.get("/products/all", isAuthenticated, getAuthSellerProducts);

/*
 *
 * PRIVATE ROUTES
 *
 */

// Initialize seller subscription
router.get("/subscription/initialize", isAuthenticated, initializeSubscription);

// Subscription callback
router.get("/subscription/callback", subscriptionCallback);

// Get all notifications for seller
router.get("/notifications/all", isAuthenticated, getNotifications);

// Get notification
router.get("/notifications/:id", isAuthenticated, getNotification);

// paystack hits the path when a seller pays
router.post("/subscription/activate", async (req: any, res: any) => {
  // const { body, headers } = req;
  // console.log({ body });
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

export default router;
