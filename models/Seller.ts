import SellerInterface from "interfaces/Seller";
import mongoose, { Schema } from "mongoose";

const SellerSchema: Schema = new Schema(
  {
    img: {
      public_id: { type: String, required: true },
      url: { type: String, required: true },
    },
    wallet: {
      balance: { type: Number, default: 0 },
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
    twitter: String,
    instagram: String,
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
    views: {
      type: {
        count: Number,
        devices: [String],
      },
      default: {
        count: 0,
        devices: [],
      },
    },
    store: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    banks: [
      {
        bank_name: String,
        bank_code: String,
        account_name: String,
        account_number: String,
        _default: Boolean,
      },
    ],
    cards: [
      {
        authorization_code: String,
        card_type: String,
        last4: String,
        exp_month: String,
        exp_year: String,
        bin: String,
        bank_name: String,
        channel: String,
        signature: String,
        reusable: Boolean,
        country_code: String,
        account_name: String,
      },
    ],
    ratings: [Number],
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
