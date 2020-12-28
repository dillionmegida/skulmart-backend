import { Document, Schema } from "mongoose";
import ImageInterface from "./Image";

export default interface ProductInterface extends Document {
  img: ImageInterface;
  _id: string;
  name: string;
  desc: string;
  category: string;
  price: string;
  quantity: number;
  quantity_sold: number;
  views: {
    count: number;
    devices: string[];
  };
  visible: boolean;
  store_id: Schema.Types.ObjectId;
  seller_id: Schema.Types.ObjectId;
}
