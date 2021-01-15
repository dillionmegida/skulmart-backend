import mongoose, { Document } from "mongoose";
import ImageInterface from "./Image";

export default interface StoreInterface extends Document {
  _id: mongoose.Types.ObjectId;
  img: ImageInterface;
  shortname: string;
  schoolname: string;
  location: string;
}
