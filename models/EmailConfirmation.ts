import EmailConfirmationInterface from "interfaces/EmailConfirmation";
import mongoose, { Schema } from "mongoose";

const EmailConfirmationSchema: Schema = new Schema(
  {
    generatedHash: {
      type: String,
      required: true,
    },
    seller_id: {
      type: Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<EmailConfirmationInterface>(
  "EmailConfirmation",
  EmailConfirmationSchema,
  "emailConfirmations"
);
