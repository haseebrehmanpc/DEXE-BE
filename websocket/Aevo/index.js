const WebSocket = require("ws");
const { socketError } = require("../../utils");

const wsAevo = new WebSocket("wss://ws.aevo.xyz");
wsAevo.on("error", (err) => socketError("wsAevo", err));

wsAevo.on("open", function open() {
  console.log("opened connection for wsAevo");
});

module.exports = {
  wsAevo,
};
