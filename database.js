const mongoose = require("mongoose");

// connect to mongo atlas cluster
const connection = require("./config/keys").MongoURI;

// @title Uplink connection to Mongoose ATLAS

mongoose
  .connect(connection, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => console.log("Database Connected Successfully 👍"))
  .catch((err) => console.log(err));
