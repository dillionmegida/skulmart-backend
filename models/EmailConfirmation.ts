import EmailConfirmationInterface from "interfaces/EmailConfirmation";
import mongoose, { Schema } from "mongoose";

const EmailConfirmationSchema: Schema = new Schema(
  {
    generatedHash: {
      type: String,
      required: true,
    },
    user_type: {
      type: String,
      required: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
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
