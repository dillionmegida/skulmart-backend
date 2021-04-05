import mongoose, { Document } from "mongoose";
import ImageInterface from "./Image";

type STATUS = "TO_BE_UPDATED" | "TO_BE_REVIEWED";

export default interface ValidationDocumentInterface extends Document {
  _id: mongoose.Types.ObjectId;
  seller: mongoose.Types.ObjectId;
  img: ImageInterface;
  createdAt: Date;
  status: STATUS;
  error_msg?: string;
}
