import ValidationDocumentInterface from "interfaces/ValidationDocument";
import mongoose, { Schema } from "mongoose";

const ValidationDocumentSchema: Schema = new Schema(
  {
    img: {
      public_id: { type: String, required: true },
      url: { type: String, required: true },
    },
    status: {
      type: String,
      enum: ["TO_BE_UPDATED", "TO_BE_REVIEWED"],
      default: "TO_BE_REVIEWED",
    },
    error_msg: {
      type: String,
      default: null,
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
