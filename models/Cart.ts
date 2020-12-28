import CartInterface from "interfaces/Cart";
import mongoose, { Schema } from "mongoose";

const CartSchema: Schema = new Schema(
  {
    buyer: { type: Schema.Types.ObjectId, required: true, ref: "Buyer" },
    product: {
      type: String,
      required: true,
      ref: "Product",
    },
    quantity: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<CartInterface>("Cart", CartSchema, "carts");
