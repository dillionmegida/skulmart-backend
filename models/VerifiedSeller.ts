import VerifiedSellerInterface from "interfaces/VerifiedSeller";
import mongoose, { Schema } from "mongoose";

const VerifiedSellerSchema: Schema = new Schema(
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

export default mongoose.model<VerifiedSellerInterface>(
  "VerifiedSeller",
  VerifiedSellerSchema,
  "verifiedSellers"
);
