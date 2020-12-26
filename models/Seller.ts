import SellerInterface from "interfaces/Seller";
import mongoose, { Schema } from "mongoose";

const SellerSchema: Schema = new Schema(
  {
    img: {
      type: Object,
      required: true,
    },
    fullname: {
      type: String,
      required: true,
    },
    brand_name: {
      type: String,
    },
    user_type: {
      type: String,
      default: "seller",
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    brand_desc: {
      type: String,
      required: true,
    },
    whatsapp: {
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
    subscription_type: {
      type: String,
      default: null,
    },
    subscription_reference: {
      type: String,
      default: null,
    },
    subscription_start_date: {
      type: Date,
      default: null,
    },
    subscription_end_date: {
      type: Date,
      default: null,
    },
    password: {
      type: String,
      required: true,
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

export default mongoose.model<SellerInterface>(
  "Seller",
  SellerSchema,
  "sellers"
);
