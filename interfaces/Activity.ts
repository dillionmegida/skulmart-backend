import { Document } from "mongoose";

export default interface ActivityInterface extends Document {
  _id: string;
  user_id: string;
  user_type: "buyer" | "seller";
  message: string;
}
