import mongoose, { Schema } from "mongoose";
import SavedProductInterface from "interfaces/SavedProduct";

const SavedProductSchema: Schema = new Schema(
  {
    buyer: {
      type: Schema.Types.ObjectId,
      ref: "Buyer",
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<SavedProductInterface>(
  "SavedProduct",
  SavedProductSchema,
  "savedProducts"
);
