import mongoose, { Schema } from "mongoose";
import shortid from "shortid";
import ProductInterface from "interfaces/Product";

const ProductSchema: Schema = new Schema(
  {
    img: {
      public_id: { type: String, required: true },
      url: { type: String, required: true },
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
    delivery_fee: {
      type: Number,
      default: 0,
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
    views_count: {
      type: Number,
      default: 0,
    },
    views_devices: {
      type: [String],
      default: [],
    },
    visible: {
      type: Boolean,
      default: false,
    },
    store: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },
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

export default mongoose.model<ProductInterface>(
  "Product",
  ProductSchema,
  "products"
);
