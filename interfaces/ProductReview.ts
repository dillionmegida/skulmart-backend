import mongoose, { Document } from "mongoose";

type STATUS = "AWAITING_REVIEW" | "DECLINED" | "ACCEPTED";

export default interface ProductReviewInterface extends Document {
  _id: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  buyer: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId;
  rating: number;
  status: STATUS;
  review: string;
}
