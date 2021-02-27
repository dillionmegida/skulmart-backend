import mongoose from "mongoose";

type Rating = {
  buyer_id: mongoose.Types.ObjectId;
  rating: number;
};

type Ratings = Rating[];

export default Ratings;
