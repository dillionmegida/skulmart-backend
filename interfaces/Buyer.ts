import { Document } from "mongoose";
import ImageInterface from "./Image";

export default interface BuyerInterface extends Document {
  _id: string;
  img: ImageInterface;
  password: string;
  fullname: string;
  email: string;
  email_confirm: boolean;
  store_id: string;
  store_name: string;
  type: "buyer";
}
