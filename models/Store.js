const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const storeSchema = new Schema(
  {
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

module.exports = mongoose.model("Store", storeSchema, "stores");
