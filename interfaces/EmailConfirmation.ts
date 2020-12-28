import { Document, Schema } from "mongoose";

export default interface EmailConfirmationInterface extends Document {
  _id: Schema.Types.ObjectId;
  generatedHash: string;
  user_id: string;
  user_type: "seller" | "buyer";
}
