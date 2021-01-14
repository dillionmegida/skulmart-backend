import ProductReviewInterface from "interfaces/ProductReview";
import mongoose, { Schema } from "mongoose";

const ProductReviewSchema: Schema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, required: true, ref: "Product" },
    order: { type: Schema.Types.ObjectId, required: true, ref: "Order" },
    buyer: { type: Schema.Types.ObjectId, required: true, ref: "Buyer" },
    rating: { type: Number, required: true },
    review: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ProductReviewInterface>(
  "ProductReview",
  ProductReviewSchema,
  "productReviews"
);
