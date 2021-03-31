import CartInterface from "interfaces/Cart";
import mongoose, { Schema } from "mongoose";

const CartSchema: Schema = new Schema(
  {
    buyer: { type: Schema.Types.ObjectId, required: true, ref: "Buyer" },
    buyer_desc: { type: String, default: null },
    product: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    },
    quantity: {
      type: Number,
      required: true,
    },
    negotiation: {
      type: Schema.Types.ObjectId,
      default: null,
      ref: "Negotiation",
    },
    seller: { type: Schema.Types.ObjectId, required: true, ref: "Seller" },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<CartInterface>("Cart", CartSchema, "carts");
