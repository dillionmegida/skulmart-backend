import ActivityInterface from "interfaces/Activity";
import mongoose, { Schema } from "mongoose";

const BuyerActivitySchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "Buyer", required: true },
    user_type: { type: String, default: "buyer" },
    message: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ActivityInterface>(
  "BuyerActivity",
  BuyerActivitySchema,
  "buyerActivities"
);
