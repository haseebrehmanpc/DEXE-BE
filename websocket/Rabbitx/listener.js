const { compareAndSendResponse } = require("../../socketutils");
const { generateUnixTimeWithSameLength } = require("../../utils");
const { wsRabbitx } = require("./index");

const rabbitxListener = (wss) => {
  wsRabbitx.on("message", function message(data) {
    try {
      const parseData = JSON.parse(data);
      const channel = parseData?.push?.channel;
      if (!channel) return;
      const regex = /market:(\w+)-(\w+)/;
      const match = channel?.match(regex);
      const coinSymbol = match ? match[1] : null;
      if (!coinSymbol) return;
      if (
        channel &&
        parseData?.push?.pub?.data?.best_ask &&
        parseData?.push?.pub?.data?.best_bid &&
        coinSymbol
      ) {
        const obj = {
          high: +parseData?.push?.pub?.data?.best_bid,
          low: +parseData?.push?.pub?.data?.best_ask,
          time: generateUnixTimeWithSameLength(13),
          dataOf: "Rabbitx",
          symbol: coinSymbol,
        };
        compareAndSendResponse(obj, wss);
      }
    } catch (e) {
    //   console.log("error in raabitx message ", e);
    }
  });
};

module.exports = {
  rabbitxListener,
};
