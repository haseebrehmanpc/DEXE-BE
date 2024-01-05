const { assets } = require("./constant/assets");
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

const findVertexSymbolById = (num) => {
  return assets?.vertexAsset.find(({ product_id }) => product_id === num)
    ?.symbol;
};
const findVertexIdBySymbol = (currSymbol) => {
  return assets?.vertexAsset.find(({ symbol }) => symbol === currSymbol)
    ?.product_id;
};

async function findCommonSymbol(...arrays) {
  const stringCountMap = {};

  // Count occurrences of each string in arrays
  arrays.forEach((arr) => {
    arr.forEach((str) => {
      if (stringCountMap[str]) {
        stringCountMap[str]++;
      } else {
        stringCountMap[str] = 1;
      }
    });
  });

  // Filter strings that appear in two or more arrays
  const commonStrings = Object.keys(stringCountMap).filter(
    (str) => stringCountMap[str] >= 2
  );

  return commonStrings;
}
module.exports = {
  calculateHighest,
  calculateLowest,
  calculateHyperLinkLeverage,
  socketError,
  spreadPercentageCalculator,
  generateUnixTimeWithSameLength,
  findVertexIdBySymbol,
  findVertexSymbolById,
  findCommonSymbol,
};
