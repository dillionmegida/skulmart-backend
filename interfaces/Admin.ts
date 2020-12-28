import { Document, Schema } from "mongoose";

export default interface AdminInterface extends Document {
  _id: Schema.Types.ObjectId;
  fullname: string;
  email: string;
  password: string;
}
