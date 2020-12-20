import { Document } from "mongoose";

export default interface AdminInterface extends Document {
  _id: string;
  fullname: string;
  email: string;
  password: string;
}
