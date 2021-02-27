import mongoose, { Document } from "mongoose";

export default interface SavedProductInterface extends Document {
  buyer: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
}
