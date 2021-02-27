import SellerInterface from "interfaces/Seller";
import mongoose, { Schema } from "mongoose";

const SellerSchema: Schema = new Schema(
  {
    img: {
      public_id: { type: String, default: null },
      url: { type: String, default: null },
    },
    wallet: {
      balance: { type: Number, default: 0 },
      last_income: { type: Date, default: null },
      last_withdraw: { type: Date, default: null },
    },
    fullname: {
      type: String,
      default: null,
    },
    brand_category: {
      type: String,
      enum: ["FASHION", "FOOD AND DRINKS", "ELECTRONICS", "NONE"],
    },
    brand_name: {
      type: String,
      default: null,
    },
    user_type: {
      type: String,
      default: "seller",
    },
    verified: {
      type: String,
      enum: ["NONE", "AWAITING_REVIEW", "VERIFIED", "FAILED"],
      default: "NONE",
    },
    visible: {
      type: Boolean,
      default: false,
    },
    username: {
      type: String,
      default: null,
    },
    brand_desc: {
      type: String,
      default: null,
    },
    whatsapp: {
      type: String,
      default: null,
    },
    twitter: String,
    instagram: String,
    facebook: String,
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
    views_count: {
      type: Number,
      default: 0,
    },
    views_devices: {
      type: [String],
      default: [],
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
    ratings: [
      {
        buyer_id: Schema.Types.ObjectId,
        rating: Number,
      },
    ],
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
