import mongoose, { Document } from "mongoose";
import ImageInterface from "./Image";
import Views from "./Views";

export default interface ProductInterface extends Document {
  img: ImageInterface;
  _id: mongoose.Types.ObjectId;
  name: string;
  desc: string;
  category: string;
  price: string;
  quantity: number;
  quantity_sold: number;
  views: Views;
  visible: boolean;
  store: mongoose.Types.ObjectId;
  seller: mongoose.Types.ObjectId;
  ratings: number[];
}
