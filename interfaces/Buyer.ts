import mongoose, { Document } from "mongoose";
import ImageInterface from "./Image";

export default interface BuyerInterface extends Document {
  _id: mongoose.Types.ObjectId;
  img: ImageInterface;
  cart: mongoose.Types.ObjectId[];
  password: string;
  fullname: string;
  email: string;
  email_confirm: boolean;
  store_id: mongoose.Types.ObjectId;
  store_name: string;
  user_type: "buyer";
}
