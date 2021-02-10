import mongoose, { Document } from "mongoose";

export type ActivityType =
  | "PASSWORD_CHANGED"
  | "EMAIL_CHANGED"
  | "ORDER_BOUGHT"
  | "ORDER_RECEIVED"
  | "ORDER_REVIEWED"
  | "ITEM_LISTED"
  | "MONEY_WITHDRAWN"
  | "ITEMS_REMOVED";

export default interface ActivityInterface extends Document {
  _id: mongoose.Types.ObjectId;
  type: ActivityType;
  for_buyer: boolean;
  for_seller: boolean;
  order: mongoose.Types.ObjectId;
  buyer: mongoose.Types.ObjectId;
  seller: mongoose.Types.ObjectId;
  meta: { [x: string]: any };
}
