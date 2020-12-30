import BuyerInterface from "interfaces/Buyer";
import mongoose, { Schema } from "mongoose";

const BuyerSchema: Schema = new Schema(
  {
    img: {
      type: Object,
      required: true,
    },
    user_type: {
      type: String,
      default: "buyer",
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
    cart: [
      {
        type: Schema.Types.ObjectId,
        ref: "Cart",
      },
    ],
    store: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<BuyerInterface>("Buyer", BuyerSchema, "buyers");
