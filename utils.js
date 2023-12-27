const calculateHyperLinkLeverage = (jsonData) => {
  const levels = jsonData?.data?.levels;
  if (!levels?.length)
    return {
      high: null,
      low: null,
      time: null,
    };
  let lowestN1 = null;
  let highestN2 = null;
  levels?.forEach((level) => {
    level?.forEach((entry) => {
      if (
        entry.n === 1 &&
        (lowestN1 === null || parseFloat(entry.px) < lowestN1)
      ) {
        lowestN1 = parseFloat(entry.px);
      } else if (
        entry.n === 2 &&
        (highestN2 === null || parseFloat(entry.px) > highestN2)
      ) {
        highestN2 = parseFloat(entry.px);
      }
    });
  });

  return {
    high: highestN2,
    low: lowestN1,
    time: jsonData?.data?.time,
  };
};
let firstResponseSend = false;
let lastResponse = null;
let lastCoin = null;
const compareAndSendResponse = (
  aevoData,
  hyperlinkData,
  wsDriftLastData,
  wsCopy,
  coin
) => {
  if (coin !== lastCoin) {
    lastCoin = coin;
    lastResponse = null;
    firstResponseSend = false;
  }
  console.log("hyperlinkData >> ", hyperlinkData);
  console.log("wsDriftLastData >> ", wsDriftLastData);
  console.log("aevoData >> ", aevoData);
  const aevoTimestamp = Math.floor(aevoData?.time / 1000000);
  const hyperlinkTimestamp = hyperlinkData?.time;
  const driftTimeStamp = wsDriftLastData?.time;
  const arryToCal = [];
  console.log(driftTimeStamp, hyperlinkTimestamp, aevoTimestamp);
  if (aevoData) arryToCal.push(aevoData);
  if (hyperlinkData) arryToCal.push(hyperlinkData);
  if (wsDriftLastData) arryToCal.push(wsDriftLastData);
  if (arryToCal.length) {
    const highestOne = calculateHighest(arryToCal);

    const lowestOne = calculateLowest(arryToCal);
    // return if data of same exchange
    if (highestOne.dataOf === lowestOne.dataOf) return;
    // return for negative spreads
    if (highestOne.high < lowestOne.low) return;
    const spreadPercent = spreadPercentageCalculator(
      highestOne.high,
      lowestOne.low
    );


    const obj = {
      spread: spreadPercent.toFixed(2),
      highOnSite: highestOne.dataOf,
      lowOnSite: lowestOne.dataOf,
      high: highestOne.high,
      low: lowestOne.low,
    };

    if (firstResponseSend) {
      // logic ki **** krra
      console.log("ehmm : ", obj.high > lastResponse.high);
      if (obj.high > lastResponse.high) {
        wsCopy.send(JSON.stringify({ ...obj }));
        lastResponse = obj;
      }
    } else {
      firstResponseSend = true;
      wsCopy.send(JSON.stringify({ ...obj }));
      lastResponse = obj;
    }
    // console.log("res send : ", obj);
  }
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
    return current?.low > highest?.low ? current : highest;
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
