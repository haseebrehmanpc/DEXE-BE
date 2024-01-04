const { commonOnFive } = require("./constant/assets");
const {
  spreadPercentageCalculator,
  calculateHighest,
  calculateLowest,
} = require("./utils");

let aevoLastDataObjs = {};
let hyperLastDataObjs = {};
let driftLastDataObjs = {};
let vertexLastDataObjs = {};
let rabbitXLastDataObjs = {};
const compareAndSendResponse = (obj, wsCopy) => {

  // const aevoTimestamp = Math.floor(aevoData?.time / 1000000);
  // const hyperlinkTimestamp = hyperlinkData?.time;
  // const driftTimeStamp = wsDriftLastData?.time;
  if (obj.dataOf === "Aevo") {
    aevoLastDataObjs[obj.symbol] = obj;
  } else if (obj.dataOf === "Drift") {
    driftLastDataObjs[obj.symbol] = obj;
  } else if (obj.dataOf === "Hyper") {
    hyperLastDataObjs[obj.symbol] = obj;
  } else if (obj.dataOf === "Vertex") {
    vertexLastDataObjs[obj.symbol] = obj;
  } else if (obj.dataOf === "Rabbitx") {
    rabbitXLastDataObjs[obj.symbol] = obj;
  }
  sendResponse(wsCopy);
};
const sendResponse = (wsCopy) => {

  const arrayToSend = [];

  commonOnFive.map((symbol, i) => {
    const arryToCal = [];
    if (aevoLastDataObjs[symbol] !== undefined) {
      arryToCal.push(aevoLastDataObjs[symbol]);
    }
    if (driftLastDataObjs[symbol] !== undefined) {
      arryToCal.push(driftLastDataObjs[symbol]);
    }
    if (hyperLastDataObjs[symbol] !== undefined) {
      arryToCal.push(hyperLastDataObjs[symbol]);
    }

    if (vertexLastDataObjs[symbol] !== undefined) {
      arryToCal.push(vertexLastDataObjs[symbol]);
    }

    if (rabbitXLastDataObjs[symbol] !== undefined) {
      arryToCal.push(rabbitXLastDataObjs[symbol]);
    }

    // return as symbol data found on only 1 site
    if (arryToCal.length <= 1) return;
    const highestOne = calculateHighest(arryToCal);

    const lowestOne = calculateLowest(arryToCal);

    // return if data of same exchange has highest and lowest
    if (highestOne?.dataOf === lowestOne?.dataOf) return;

    // return for negative spreads
    if (highestOne?.high < lowestOne?.low) return;

    const spreadPercent = spreadPercentageCalculator(
      highestOne.high,
      lowestOne.low
    );

    const obj = {
      spread: +spreadPercent.toFixed(2),
      highOnSite: highestOne.dataOf,
      lowOnSite: lowestOne.dataOf,
      high: highestOne.high,
      low: lowestOne.low,
      symbol,
    };
    arrayToSend.push(obj);
  });

  arrayToSend.sort((a, b) => b.spread - a.spread);
  wsCopy.send(JSON.stringify(arrayToSend));
};

module.exports = {
  compareAndSendResponse,
};
