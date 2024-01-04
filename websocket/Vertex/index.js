const { socketError } = require("../../utils");
const WebSocket = require("ws");

const wsVertex = new WebSocket(
  "wss://gateway.prod.vertexprotocol.com/v1/subscribe"
);

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
