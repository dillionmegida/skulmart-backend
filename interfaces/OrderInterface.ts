import mongoose, { Document } from "mongoose";
import ProductInterface from "./Product";
import SellerInterface from "./Seller";
import StoreInterface from "./Store";

export default interface OrderInterface extends Document {
  _id: mongoose.Types.ObjectId;
  ref: string;
  product: mongoose.Types.ObjectId;
  product_populated: ProductInterface;
  buyer: mongoose.Types.ObjectId;
  seller: mongoose.Types.ObjectId;
  seller_username: string;
  quantity: number;
  price_when_bought: number;
  has_buyer_received: boolean;
}

export type GroupedItemsPurchasedBySeller = {
  [username: string]: {
    items: {
      product_populated: ProductInterface;
      quantity: number;
      price_when_bought: number;
    }[];
    seller_info: SellerInterface & { store: StoreInterface };
  };
};
