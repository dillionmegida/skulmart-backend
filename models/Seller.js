const mongoose = require("mongoose");

const { Schema } = mongoose;

const sellerSchema = new Schema(
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

module.exports = mongoose.model("Seller", sellerSchema, "sellers");
