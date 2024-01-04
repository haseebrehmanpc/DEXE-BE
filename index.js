const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { createWebsocketServer } = require("./websocket");
dotenv.config();

const app = express();
app.use(cors());

// Define a route for the root URL
app.get("/", (req, res) => {
  res.send("Server is runing!");
});

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

createWebsocketServer(server);
