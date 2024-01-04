const { compareAndSendResponse } = require("../../socketutils");
const { calculateHyperLinkLeverage } = require("../../utils");
const { wsHyperlink } = require("./index");

const hyperListner = (wsCopy) => {
  wsHyperlink.on("message", function message(data) {
    const parseData = JSON.parse(data);
    // returning if getting response of other coin
    const coinSymbol = parseData?.data?.coin;
    if (!coinSymbol) return;
    const { high, low, time } = calculateHyperLinkLeverage(parseData);
    const obj = {
      high,
      low,
      time,
      dataOf: "Hyper",
      symbol: coinSymbol,
    };
    if (high && low) {
      wsHyperlinkLastData = obj;
      compareAndSendResponse(obj, wsCopy);
    }
  });
};

module.exports = {
  hyperListner,
};
