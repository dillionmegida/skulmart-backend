import mongoose, { Document } from "mongoose";
import Bank from "./Bank";
import Card from "./Card";
import ImageInterface from "./Image";
import Views from "./Views";
import Wallet from "./Wallet";

export default interface SellerInterface extends Document {
  _id: mongoose.Types.ObjectId;
  img: ImageInterface;
  wallet: Wallet;
  fullname: string;
  brand_name: string;
  username: string;
  brand_desc: string;
  whatsapp: string;
  twitter: string;
  instagram: string;
  email: string;
  views: Views;
  email_confirm: boolean;
  subscription_type: string;
  subscription_reference: string;
  password: string;
  banks: Bank[];
  cards: Card[];
  store: mongoose.Types.ObjectId;
  user_type: "seller";
  ratings: number[];
}
