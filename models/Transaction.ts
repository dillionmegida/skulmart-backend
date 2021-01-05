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
});

export default mongoose.model<TransactionInterface>(
  "Transaction",
  TransactionSchema,
  "transactions"
);
