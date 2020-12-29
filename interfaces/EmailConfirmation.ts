import mongoose, { Document } from "mongoose";

export default interface EmailConfirmationInterface extends Document {
  _id: mongoose.Types.ObjectId;
  generatedHash: string;
  user_id: string;
  user_type: "seller" | "buyer";
}
