import mongoose, { Document } from "mongoose";
import Bank from "./Bank";
import ImageInterface from "./Image";

export default interface BuyerInterface extends Document {
  _id: mongoose.Types.ObjectId;
  img: ImageInterface;
  cart: mongoose.Types.ObjectId[];
  banks: Bank[];
  password: string;
  fullname: string;
  email: string;
  email_confirm: boolean;
  phone: string;
  store: mongoose.Types.ObjectId;
  user_type: "buyer";
}
