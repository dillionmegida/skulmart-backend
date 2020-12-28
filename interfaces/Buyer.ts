import { Document, Schema } from "mongoose";
import ImageInterface from "./Image";

export default interface BuyerInterface extends Document {
  _id: Schema.Types.ObjectId;
  img: ImageInterface;
  cart: Schema.Types.ObjectId[];
  password: string;
  fullname: string;
  email: string;
  email_confirm: boolean;
  store_id: Schema.Types.ObjectId;
  store_name: string;
  user_type: "buyer";
}
