const path = require("path");

const express = require("express");
const storeMeta = require("../../meta-tags/store-site");

const app = express();

app.use(storeMeta);

app.use(express.static(path.join(__dirname, "../../../client_store/build")));

app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "../../../client_store/build/index.html"))
);

module.exports = app;
