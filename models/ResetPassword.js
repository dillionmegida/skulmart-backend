const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const resetPassWordSchema = new Schema(
  {
    generatedHash: {
      type: String,
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

module.exports = mongoose.model(
  "ResetPassword",
  resetPassWordSchema,
  "resetPasswords"
);
