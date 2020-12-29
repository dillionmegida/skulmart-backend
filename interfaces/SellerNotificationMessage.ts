import mongoose, { Document } from "mongoose";

export default interface SellerNotificationMessageInterface extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  message: string;
  viewedIds: mongoose.Types.ObjectId[];
}
