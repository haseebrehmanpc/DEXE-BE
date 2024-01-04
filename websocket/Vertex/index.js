const { socketError } = require("../../utils");
const WebSocket = require("ws");
const { VERTEX_URL } = require("../../config/index");
const wsVertex = new WebSocket(VERTEX_URL);

wsVertex.on("error", (err) => socketError("wsVertex", err));

wsVertex.on("open", function open() {
  console.log("connection openned for wsVertex ");
});
function keepVertexLive() {
  wsVertex.send(
    JSON.stringify({
      method: "subscribe",
      stream: {
        type: "best_bid_offer",
        product_id: 800,
      },
      id: 0,
    })
  );
  console.log("Keeping vertex liquid alive!");
}

const intervalId2 = setInterval(keepVertexLive, 30000);

module.exports = {
  wsVertex,
};
