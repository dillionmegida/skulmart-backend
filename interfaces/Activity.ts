import mongoose, { Document } from "mongoose";

export default interface ActivityInterface extends Document {
  _id: mongoose.Types.ObjectId;
  seller?: mongoose.Types.ObjectId;
  user_type: "buyer" | "seller";
  buyer?: mongoose.Types.ObjectId;
  order?: mongoose.Types.ObjectId;
  options: {
    type: "SELLER_WITHDRAW";
    withdraw_amount: number;
  };
}
