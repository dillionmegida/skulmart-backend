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
    buyer_desc: { type: String, default: null },
    delivery_fee_when_bought: { type: Number, default: 0, min: 0 },
    did_buyer_close: { type: Boolean, default: false },
    confirm_order_url: { type: String, required: true },
    // the following properties are when the buyer has received
    has_buyer_received: { type: Boolean, default: false },
    buyer_received_date: { type: Date, default: null },
    seller_review: { type: String, default: null },
    seller_rating: { type: Number, default: null },
    has_buyer_reviewed_order: { type: Boolean, default: false },
    review: {
      type: Schema.Types.ObjectId,
      ref: "ProductReview",
    },
    seller_receipt_code: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<OrderInterface>("Order", OrderSchema, "orders");
