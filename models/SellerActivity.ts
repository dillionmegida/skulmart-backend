import ActivityInterface from "interfaces/Activity";
import mongoose, { Schema } from "mongoose";

const SellerActivitySchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "Seller", required: true },
    user_type: { type: String, default: "seller" },
    message: { type: String, required: true },
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
