import BuyerInterface from "interfaces/Buyer";
import mongoose, { Schema } from "mongoose";

const BuyerSchema: Schema = new Schema(
  {
    img: {
      type: Object,
      required: true,
    },
    fullname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    email_confirm: {
      type: Boolean,
      default: false,
    },
    store_id: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    store_name: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<BuyerInterface>("Buyer", BuyerSchema, "buyers");
