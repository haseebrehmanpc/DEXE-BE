const WebSocket = require("ws");
const { socketError } = require("../../utils");
const { DRIFT_URL } = require("../../config/index");
const wsDrift = new WebSocket(DRIFT_URL);
wsDrift.on("error", (err) => socketError("Drift", err));

wsDrift.on("open", function open() {
  console.log("connection openned for wsDrift ");
});

module.exports = {
  wsDrift,
};
