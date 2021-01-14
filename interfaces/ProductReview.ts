import mongoose, { Document } from "mongoose";

export default interface ProductReviewInterface extends Document {
  _id: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  buyer: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId;
  rating: number;
  review: string;
}
