import ValidationDocumentInterface from "interfaces/ValidationDocument";
import mongoose, { Schema } from "mongoose";

const ValidationDocumentSchema: Schema = new Schema(
  {
    img: {
      public_id: { type: String, required: true },
      url: { type: String, required: true },
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ValidationDocumentInterface>(
  "ValidationDocument",
  ValidationDocumentSchema,
  "validationDocuments"
);
