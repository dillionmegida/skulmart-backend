import ActivityInterface from "interfaces/Activity";
import mongoose, { Schema } from "mongoose";

const BuyerActivitySchema: Schema = new Schema(
  {
    buyer: { type: Schema.Types.ObjectId, ref: "Buyer", required: true },
    order: { type: Schema.Types.ObjectId, ref: "Order", default: null },
    type: { type: String, required: true },
    options: { type: Object, default: null },
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
