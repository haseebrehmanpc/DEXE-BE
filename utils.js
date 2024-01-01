const { commonOnThree } = require("./constant/assets");

const calculateHyperLinkLeverage = (jsonData) => {
  const levels = jsonData?.data?.levels;
  if (!levels?.length)
    return {
      high: null,
      low: null,
      time: null,
    };
  let maxLengthPx = -Infinity;
  let highestBid = null;
  let lowestAsk = null;
  levels?.forEach((level) => {
    level?.forEach((entry) => {
      const pxLength = entry.px.length;
      if (pxLength > maxLengthPx) {
        maxLengthPx = pxLength;
      }
    });
  });
  levels?.forEach((level, ind) => {
    level?.forEach((entry) => {
      if (ind === 0 && !highestBid) {
        // for highest bid pick first maxLengthPx value
        const pxLength = entry.px.length;
        if (pxLength == maxLengthPx && entry?.px) {
          highestBid = entry?.px;
        }
      }
      if (ind === 1 && !lowestAsk) {
        // for lowest ask
        const pxLength = entry.px.length;
        if (pxLength == maxLengthPx && entry?.px) {
          lowestAsk = entry?.px;
        }
      }
    });
  });

  return {
    high: +highestBid,
    low: +lowestAsk,
    time: jsonData?.data?.time,
  };
};

let aevoLastDataObjs = {};
let hyperLastDataObjs = {};
let driftLastDataObjs = {};
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
  }
  sendResponse(wsCopy);
};
const sendResponse = (wsCopy) => {
  const arrayToSend = [];

  commonOnThree.map((symbol, i) => {
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
const socketError = (source, error) => {
  console.log(`Error in ${source}: `, error);
};

const spreadPercentageCalculator = (high, low) => {
  const spread = +high - +low;

  const midPoint = (+high + +low) / 2;
  const spreadPercentage = (spread / midPoint) * 100;
  return spreadPercentage;
};

const calculateHighest = (objects) => {
  if (objects.length === 0) {
    return null;
  }

  return objects.reduce((highest, current) => {
    return current?.high > highest?.high ? current : highest;
  }, objects[0]);
};
const calculateLowest = (objects) => {
  if (objects.length === 0) {
    return null;
  }

  return objects.reduce((highest, current) => {
    return current?.low < highest?.low ? current : highest;
  }, objects[0]);
};

const generateUnixTimeWithSameLength = (length) => {
  const currentTimeMilliseconds = Date.now();
  const currentTimeSeconds = Math.floor(currentTimeMilliseconds / 1000);

  // Adjust the length of the timestamp
  const generatedUnixTime =
    length === 10
      ? currentTimeSeconds // Keep it in seconds
      : Math.floor(currentTimeMilliseconds * Math.pow(10, length - 13)); // Convert to milliseconds and adjust length

  return generatedUnixTime;
};
module.exports = {
  compareAndSendResponse,
  calculateHyperLinkLeverage,
  socketError,
  spreadPercentageCalculator,
  generateUnixTimeWithSameLength,
};
