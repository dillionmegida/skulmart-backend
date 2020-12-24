import ResetPasswordInterface from "interfaces/ResetPassword";
import mongoose, { Schema } from "mongoose";

const ResetPassWordSchema: Schema = new Schema(
  {
    generatedHash: {
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

export default mongoose.model<ResetPasswordInterface>(
  "ResetPassword",
  ResetPassWordSchema,
  "resetPasswords"
);
