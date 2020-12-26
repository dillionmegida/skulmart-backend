import SellerNotificationMessageInterface from "interfaces/SellerNotificationMessage";
import mongoose, { Schema } from "mongoose";

const SellerNotificationMessageSchema: Schema = new Schema(
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

export default mongoose.model<SellerNotificationMessageInterface>(
  "SellerNotificationMessage",
  SellerNotificationMessageSchema,
  "sellerNotificationMessages"
);
