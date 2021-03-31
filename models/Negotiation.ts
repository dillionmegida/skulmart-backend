import NegotiationInterface from "interfaces/Negotiation";
import mongoose, { Schema } from "mongoose";

const NegotiationSchema: Schema = new Schema(
  {
    buyer: { type: Schema.Types.ObjectId, required: true, ref: "Buyer" },
    product: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    },
    seller: { type: Schema.Types.ObjectId, required: true, ref: "Seller" },
    negotiated_price: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: ["AWAITING BUYER", "AWAITING SELLER", "CLOSED"],
      default: "AWAITING SELLER",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<NegotiationInterface>(
  "Negotiation",
  NegotiationSchema,
  "negotiations"
);
