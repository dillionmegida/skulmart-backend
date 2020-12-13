const mongoose = require("mongoose");

const { Schema } = mongoose;

const sellerNotificationMessageSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    viewedIds: {
      // to watch for those that have viewed the notification
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "SellerNotificationMessage",
  sellerNotificationMessageSchema,
  "sellerNotificationMessages"
);
