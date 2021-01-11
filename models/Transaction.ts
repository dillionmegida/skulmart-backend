import TransactionInterface from "interfaces/TransactionInterface";
import mongoose, { Schema } from "mongoose";

const TransactionSchema: Schema = new Schema({
  products: [
    {
      product: Schema.Types.ObjectId,
      quantity: Number,
      price_when_bought: Number,
      has_buyer_paid: Boolean,
      has_buyer_received: Boolean,
    },
  ],
  status: {
    type: String,
    default: "none",
  },
  payment_link: {
    type: String,
    default: null,
  },
});

export default mongoose.model<TransactionInterface>(
  "Transaction",
  TransactionSchema,
  "transactions"
);
