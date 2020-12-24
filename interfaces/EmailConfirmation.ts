import { Document } from "mongoose";

export default interface EmailConfirmationInterface extends Document {
  _id: string;
  generatedHash: string;
  user_id: string;
}
