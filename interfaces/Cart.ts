import mongoose, { Document } from "mongoose";

export default interface CartInterface extends Document {
  _id: mongoose.Types.ObjectId;
  buyer: mongoose.Types.ObjectId;
  buyer_desc: string;
  seller: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  quantity: number;
}
