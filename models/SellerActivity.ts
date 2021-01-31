import ActivityInterface from "interfaces/Activity";
import mongoose, { Schema } from "mongoose";

const SellerActivitySchema: Schema = new Schema(
  {
    seller: { type: Schema.Types.ObjectId, ref: "Seller", required: true },
    order: { type: Schema.Types.ObjectId, ref: "Order", default: null },
    type: { type: String, required: true },
    options: { type: Object, default: null },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ActivityInterface>(
  "SellerActivity",
  SellerActivitySchema,
  "sellerActivities"
);
