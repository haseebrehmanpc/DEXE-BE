const WebSocket = require("ws");
const { socketError } = require("../../utils");

const wsDrift = new WebSocket("wss://dlob.drift.trade/ws");
wsDrift.on("error", (err) => socketError("Drift", err));

wsDrift.on("open", function open() {
  console.log("connection openned for wsDrift ");
});

module.exports = {
  wsDrift,
};
