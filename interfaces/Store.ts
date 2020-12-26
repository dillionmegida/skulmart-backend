import { Document } from "mongoose";

export default interface StoreInterface extends Document {
  _id: string;
  shortname: string;
  schoolname: string;
  location: string;
}
