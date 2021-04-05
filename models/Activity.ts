import ActivityInterface from "interfaces/Activity";
import mongoose, { Schema } from "mongoose";

const ActivitySchema: Schema = new Schema(
  {
    type: {
      type: String,
      enum: [
        "PASSWORD_CHANGED",
        "EMAIL_CHANGED",
        "ORDERS_BOUGHT",
        "ORDER_RECEIVED",
        "ORDER_REVIEWED",
        "ITEM_LISTED",
        "MONEY_WITHDRAWN",
        "ITEMS_REMOVED",
      ],
      required: true,
    },
    for_buyer: { type: Boolean, required: true },
    for_seller: { type: Boolean, required: true },
    order: { type: Schema.Types.ObjectId, ref: "Order" },
    seller: { type: Schema.Types.ObjectId, ref: "Seller" },
    buyer: { type: Schema.Types.ObjectId, ref: "Buyer" },
    meta: { type: Object, default: null },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ActivityInterface>(
  "Activity",
  ActivitySchema,
  "activities"
);
