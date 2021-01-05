import mongoose, { Document } from "mongoose";

type Product = {
  product: mongoose.Types.ObjectId;
  quantity: number;
  price_when_bought: number;
  has_buyer_paid: boolean;
  has_buyer_received: boolean;
};

export default interface TransactionInterface extends Document {
  _id: mongoose.Types.ObjectId;
  products: Product[];
}
