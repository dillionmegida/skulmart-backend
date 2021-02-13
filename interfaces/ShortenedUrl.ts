import mongoose, { Document } from "mongoose";

export default interface ShortenedUrlInterface extends Document {
  _id: mongoose.Types.ObjectId;
  short_url: string;
  long_url: string;
}
