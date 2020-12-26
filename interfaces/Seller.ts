import { Document } from "mongoose";
import ImageInterface from "./Image";

export default interface SellerInterface extends Document {
  _id: string;
  img: ImageInterface;
  fullname: string;
  brand_name: string;
  username: string;
  brand_desc: string;
  whatsapp: string;
  email: string;
  email_confirm: boolean;
  subscription_type: string;
  subscription_reference: string;
  password: string;
  store_id: string;
  store_name: string;
  user_type: "seller";
}
