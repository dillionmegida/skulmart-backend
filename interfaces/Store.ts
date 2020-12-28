import { Document, Schema } from "mongoose";

export default interface StoreInterface extends Document {
  _id: Schema.Types.ObjectId;
  shortname: string;
  schoolname: string;
  location: string;
}
