import mongoose, { Document } from "mongoose";

export default interface NegotiationInterface extends Document {
  _id: mongoose.Types.ObjectId;
  buyer: mongoose.Types.ObjectId;
  seller: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  negotiated_price: number;
  status: "OPENED" | "CLOSED";
}
