import { Document, Schema } from "mongoose";
import ProductInterface from "./Product";

export default interface CartInterface extends Document {
  _id: Schema.Types.ObjectId;
  buyer: Schema.Types.ObjectId;
  product: Schema.Types.ObjectId;
  quantity: number;
}
