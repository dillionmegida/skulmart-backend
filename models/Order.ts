import OrderInterface from "interfaces/OrderInterface";
import mongoose, { Schema } from "mongoose";

const OrderSchema: Schema = new Schema(
  {
    ref: { type: String, required: true },
    product: { type: Schema.Types.ObjectId, required: true, ref: "Product" },
    buyer: { type: Schema.Types.ObjectId, required: true, ref: "Buyer" },
    seller: { type: Schema.Types.ObjectId, required: true, ref: "Seller" },
    quantity: { type: Number, required: true },
    price_when_bought: { type: Number, required: true },
    has_buyer_received: { type: Boolean, default: false },
    buyer_received_date: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<OrderInterface>("Order", OrderSchema, "orders");
