import { Document, Schema } from "mongoose";

export default interface SellerNotificationMessageInterface extends Document {
  _id: Schema.Types.ObjectId;
  title: string;
  message: string;
  viewedIds: Schema.Types.ObjectId[];
}
