const { compareAndSendResponse } = require("../../socketutils");
const { wsAevo } = require("./index");

const aevoListener = (wss) => {
  wsAevo.on("message", function message(data) {
    const parsedData = JSON.parse(data);
    // returning if getting response of other coin
    const coinSymbol = parsedData?.channel?.split(":")?.slice(1, -1)?.[0];
    // if (!coinSymbol) return;
    const obj = {
      high: +parsedData?.data?.tickers?.[0]?.bid.price,
      low: +parsedData?.data?.tickers?.[0]?.ask.price,
      time: Math.floor(+parsedData?.data?.timestamp / 1000000),
      dataOf: "Aevo",
      symbol: coinSymbol,
    };
    if (
      parsedData?.data?.tickers?.[0]?.bid.price &&
      parsedData?.data?.tickers?.[0]?.ask.price
    ) {
      compareAndSendResponse(obj, wss);
    }
  });
};

module.exports = {
  aevoListener,
};
