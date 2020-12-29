import mongoose, { Document } from "mongoose";

export default interface StoreInterface extends Document {
  _id: mongoose.Types.ObjectId;
  shortname: string;
  schoolname: string;
  location: string;
}
