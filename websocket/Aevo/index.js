const WebSocket = require("ws");
const { socketError } = require("../../utils");
const { AEVO_URL } = require("../../config/index");
const wsAevo = new WebSocket(AEVO_URL);
wsAevo.on("error", (err) => socketError("wsAevo", err));

wsAevo.on("open", function open() {
  console.log("opened connection for wsAevo");
});
function keepAevoLive() {
  wsAevo.send(
    JSON.stringify({
      id: 1,
      op: "ping",
    })
  );
  console.log("Keeping Aevo alive!");
}

const intervalId = setInterval(keepAevoLive, 15 * 60 * 1000);

module.exports = {
  wsAevo,
};
