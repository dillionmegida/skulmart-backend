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
    // the following properties are when the buyer has received
    has_buyer_received: { type: Boolean, default: false },
    buyer_received_date: { type: Date, default: null },
    seller_review: { type: String, default: null },
    seller_rating: { type: Number, default: null },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<OrderInterface>("Order", OrderSchema, "orders");
