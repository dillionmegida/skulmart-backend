import { Document } from "mongoose";

export default interface ResetPasswordInterface extends Document {
  _id: string;
  generatedHash: string;
  seller_id: string;
}
