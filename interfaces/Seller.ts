import mongoose, { Document } from "mongoose";
import Bank from "./Bank";
import Card from "./Card";
import ImageInterface from "./Image";
import Ratings from "./Ratings";
import Wallet from "./Wallet";

export type CATEGORY =
  | "FASHION"
  | "FOOD AND DRINKS"
  | "ELECTRONICS"
  | "OTHERS"
  | "GRAPHICS_DESIGN"
  | "BOOKS";

type VERIFIED_STATUS = "NONE" | "AWAITING_REVIEW" | "VERIFIED" | "FAILED";

export default interface SellerInterface extends Document {
  _id: mongoose.Types.ObjectId;
  img: ImageInterface;
  wallet: Wallet;
  verified: VERIFIED_STATUS;
  brand_category: CATEGORY;
  fullname: string;
  brand_name: string;
  username: string;
  brand_desc: string;
  whatsapp: string;
  twitter: string;
  instagram: string;
  facebook: string;
  email: string;
  views_count: number;
  views_devices: string[];
  email_confirm: boolean;
  subscription_type: string;
  subscription_reference: string;
  password: string;
  banks: Bank[];
  cards: Card[];
  store: mongoose.Types.ObjectId;
  user_type: "seller";
  visible: boolean;
  ratings: Ratings;
}
