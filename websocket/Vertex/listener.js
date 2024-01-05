const { compareAndSendResponse } = require("../../socketutils");
const { findVertexSymbolById } = require("../../utils");
const { wsVertex } = require("./index");

const vertexListener = (wss) => {
  wsVertex.on("message", function message(data) {
    const parsedData = JSON.parse(data);
    if (!parsedData?.product_id) return;
    const coinSymbol = findVertexSymbolById(parsedData?.product_id);
    if (!coinSymbol) return;
    const obj = {
      high: parsedData?.bid_price / 1e18,
      low: parsedData?.ask_price / 1e18,
      time: Math.floor(+parsedData?.timestamp / 1000000),
      dataOf: "Vertex",
      symbol: coinSymbol,
    };
    if (parsedData?.bid_price && parsedData?.ask_price) {
      compareAndSendResponse(obj, wss);
    }
  });
};

module.exports = {
  vertexListener,
};
