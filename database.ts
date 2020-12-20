import mongoose from "mongoose";

// connect to mongo atlas cluster
import { MongoURI } from "config/keys";

// @title Uplink connection to Mongoose ATLAS

mongoose
  .connect(MongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => console.log("Database Connected Successfully 👍"))
  .catch((err: any) => console.log(err));
