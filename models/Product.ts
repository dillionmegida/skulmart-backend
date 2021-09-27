import mongoose, { Schema } from "mongoose";
import ProductInterface from "interfaces/Product";

const ProductSchema: Schema = new Schema(
  {
    images: [
      {
        public_id: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
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
    is_negotiable: {
      type: Boolean,
      default: false,
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

ProductSchema.index(
  {
    name: "text",
    desc: "text",
    category: "text",
  },
  {
    weights: {
      name: 10,
      category: 7,
      desc: 4,
    },
  }
);

export default mongoose.model<ProductInterface>(
  "Product",
  ProductSchema,
  "products"
);
