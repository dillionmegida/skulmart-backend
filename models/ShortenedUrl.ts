import ShortenedUrlInterface from "interfaces/ShortenedUrl";
import mongoose, { Schema } from "mongoose";

const ShortenedUrlSchema: Schema = new Schema({
  long_url: { type: String, required: true },
  short_url: { type: String, required: true },
});

export default mongoose.model<ShortenedUrlInterface>(
  "ShortenedUrl",
  ShortenedUrlSchema,
  "shortenedUrls"
);
