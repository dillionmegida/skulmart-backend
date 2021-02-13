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
  createdAt: Date;
  did_buyer_close: boolean;
  confirm_order_url: string;
  // the following properties are when the buyer has received
  has_buyer_received: boolean;
  buyer_received_date?: Date | null;
  seller_review?: string;
  seller_rating?: number;
  has_buyer_reviewed_order?: boolean;
  review: mongoose.Types.ObjectId;
  seller_receipt_code?: string; // to initiate transfer
}

export type GroupedOrdersPurchasedFromSeller = {
  [username: string]: {
    orders: {
      _id: mongoose.Types.ObjectId;
      product_populated: ProductInterface;
      quantity: number;
      price_when_bought: number;
    }[];
    seller_info: SellerInterface & { store: StoreInterface };
  };
};
