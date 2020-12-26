import { Document } from "mongoose";

export default interface SellerNotificationMessageInterface extends Document {
  _id: string;
  title: string;
  message: string;
  viewedIds: string[];
}
