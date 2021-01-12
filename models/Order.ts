import OrderInterface from "interfaces/OrderInterface";
import mongoose, { Schema } from "mongoose";

const OrderSchema: Schema = new Schema({
  ref: { type: String, required: true },
  product: { type: Schema.Types.ObjectId, required: true },
  buyer: { type: Schema.Types.ObjectId, required: true },
  seller: { type: Schema.Types.ObjectId, required: true },
  quantity: { type: Number, required: true },
  price_when_bought: { type: Number, required: true },
  has_buyer_received: { type: Boolean, default: false },
});

export default mongoose.model<OrderInterface>(
  "Order",
  OrderSchema,
  "orders"
);
