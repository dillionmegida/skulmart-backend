import mongoose, { Document } from "mongoose";
import ProductInterface from "./Product";
import SellerInterface from "./Seller";
import StoreInterface from "./Store";

type Product = {
  product: ProductInterface;
  seller: SellerInterface;
  quantity: number;
  price_when_bought: number;
  has_buyer_paid: boolean;
  has_buyer_received: boolean;
};

export default interface TransactionInterface extends Document {
  _id: mongoose.Types.ObjectId;
  products: Product[];
  buyer: mongoose.Types.ObjectId;
}

export type GroupedItemsPurchasedBySeller = {
  [username: string]: {
    items: {
      product: ProductInterface;
      quantity: number;
      price_when_bought: number;
      has_buyer_paid: boolean;
      has_buyer_received: boolean;
    }[];
    seller_info: SellerInterface & { store: StoreInterface };
  };
};
