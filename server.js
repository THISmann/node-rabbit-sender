const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const Sender = require("./send");
const sender = new Sender();

app.use(bodyParser.json("application/json"));

// create a post to send request with body
app.post("/sendLog", async (req, res, next) => {
  await sender.publishMessage(req.body.logType, req.body.message);
  console.log(req.body);
  res.send("okay");
});

// run the node js app
app.listen(3000, () => {
  console.log("Server started...");
});