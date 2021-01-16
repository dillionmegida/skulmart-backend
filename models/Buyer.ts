import BuyerInterface from "interfaces/Buyer";
import mongoose, { Schema } from "mongoose";

const BuyerSchema: Schema = new Schema(
  {
    img: {
      public_id: { type: String, required: true },
      url: { type: String, required: true },
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
    phone: {
      type: String,
      required: true,
    },
    cart: [
      {
        type: Schema.Types.ObjectId,
        ref: "Cart",
      },
    ],
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
