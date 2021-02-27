import mongoose, { Document } from "mongoose";
import ImageInterface from "./Image";

export default interface ValidationDocumentInterface extends Document {
  _id: mongoose.Types.ObjectId;
  seller: mongoose.Types.ObjectId;
  img: ImageInterface;
  createdAt: Date;
}
