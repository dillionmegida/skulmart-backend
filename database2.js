const mongoose = require("mongoose");

// // @title connect to mongo locally

const dbName = "market-hub";
const connection = `mongodb://localhost/${dbName}`;

// @title Mongoose connection locally

mongoose.connect(connection, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const db = mongoose.connection;
db.on("open", () => console.log("Database Connected Successfully 👍"));
db.on("error", (err) => console.log(`Couldn't connect to database, ${err}`));
