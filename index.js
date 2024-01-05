const express = require("express");
const cors = require("cors");
const { createWebsocketServer } = require("./websocket");
const app = express();
app.use(cors());
const runCronJob = require("./cronJob");
const { fetchAssets } = require("./constant/assets");
fetchAssets();
require("./db/config");
// Run the cron job
runCronJob();

// Define a route for the root URL
app.get("/", (req, res) => {
  res.send("Server is runing!");
});

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

createWebsocketServer(server);
