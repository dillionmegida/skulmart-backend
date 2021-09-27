import mongoose from "mongoose";

// @title Uplink connection to Mongoose ATLAS

mongoose
  .connect(process.env.MONGO_URI as string, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => console.log("Database Connected Successfully 👍"))
  .catch((err: any) => console.log(err));
