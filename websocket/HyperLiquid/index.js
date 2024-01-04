const WebSocket = require("ws");
const { socketError } = require("../../utils");
const { HYPERLINK_URL } = require("../../config/index");
const wsHyperlink = new WebSocket(HYPERLINK_URL);

wsHyperlink.on("error", (err) => socketError("wsHyperlink", err));

wsHyperlink.on("open", function open() {
  console.log("connection openned for wsHyperlink ");
});

function keepHyperLiquidLive() {
  wsHyperlink.send(JSON.stringify({ method: "ping" }));
  console.log("Keeping hyper liquid alive!");
}

const intervalId = setInterval(keepHyperLiquidLive, 60000);
module.exports = {
  wsHyperlink,
};
