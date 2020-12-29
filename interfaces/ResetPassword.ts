import mongoose, { Document } from "mongoose";

export default interface ResetPasswordInterface extends Document {
  _id: mongoose.Types.ObjectId;
  generatedHash: string;
  user_id: mongoose.Types.ObjectId;
}
