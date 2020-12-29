import mongoose, { Document } from "mongoose";

export default interface AdminInterface extends Document {
  _id: mongoose.Types.ObjectId;
  fullname: string;
  email: string;
  password: string;
}
