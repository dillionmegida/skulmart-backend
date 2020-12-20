const mongoose = require("mongoose");
const shortid = require("shortid");

const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    _id: {
      type: String,
      default: shortid.generate,
    },
    img: {
      type: Object,
      required: true,
      default: {
        public_id: null,
        url: null,
      },
    },
    name: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      default: 1,
    },
    quantity_sold: {
      type: Number,
      default: 0,
    },
    views: {
      type: Object,
      default: {
        count: 0,
        devices: [],
      },
    },
    visible: {
      type: Boolean,
      default: false,
    },
    store_id: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    seller_id: {
      type: Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema, "products");
