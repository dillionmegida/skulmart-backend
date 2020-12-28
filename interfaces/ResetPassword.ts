import { Document, Schema } from "mongoose";

export default interface ResetPasswordInterface extends Document {
  _id: Schema.Types.ObjectId;
  generatedHash: string;
  user_id: Schema.Types.ObjectId;
}
