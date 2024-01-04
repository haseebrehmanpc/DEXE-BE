const WebSocket = require("ws");
const { socketError } = require("../../utils");
const { AEVO_URL } = require("../../config/index");
const wsAevo = new WebSocket(AEVO_URL);
wsAevo.on("error", (err) => socketError("wsAevo", err));

wsAevo.on("open", function open() {
  console.log("opened connection for wsAevo");
});

module.exports = {
  wsAevo,
};
