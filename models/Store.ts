import StoreInterface from "interfaces/Store";
import mongoose, { Schema } from "mongoose";

const StoreSchema: Schema = new Schema(
  {
    img: {
      type: {
        public_id: String,
        url: String,
      },
      required: true,
    },
    shortname: {
      type: String,
      required: true,
    },
    schoolname: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<StoreInterface>("Store", StoreSchema, "stores");
