const { compareAndSendResponse } = require("../../socketutils");
const {
  generateUnixTimeWithSameLength,

} = require("../../utils");
const { wsDrift } = require("./index");

const driftListener = (wss) => {
  wsDrift.on("message", function message(data) {
    const parseData = JSON.parse(data);
    const depthData = JSON.parse(parseData?.data || "{}");
    // returning if getting response of other coin
    const coinSymbol = depthData?.marketName?.split("-")?.[0];
    if (!coinSymbol) return;
    if (depthData?.bids?.[0] && depthData?.asks?.[0]) {
      const obj = {
        high: depthData.bids[0].price / 1000000,
        low: depthData.asks[0].price / 1000000,
        time: generateUnixTimeWithSameLength(13),
        dataOf: "Drift",
        symbol: coinSymbol,
      };
      wsDriftLastData = obj;
      compareAndSendResponse(obj, wss);
    }
  });
};

module.exports = { driftListener };
