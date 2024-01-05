const Common = require("../models/common");

let assets = {
  vertexAsset: undefined,
  vertexSymbols: undefined,
  aevoAssets: undefined,
  hyperLiquidAssets: undefined,
  driftPrepAsset: undefined,
  commonOnFive: undefined,
  rabbitxSymbol: undefined,
};
const fetchAssets = async () => {
  try {
    const data = await Common.findOne({});
    if (data?.commonAssets.length) {
      assets.commonOnFive = data.commonAssets;
    }
    if (data?.entities.length) {
      data.entities.map((item) => {
        if (item.key === "Vertex") {
          assets.vertexAsset = item.assets;
          assets.vertexSymbols = item.assets.map((item) => item.symbol);
        }
        if (item.key === "Aevo") {
          assets.aevoAssets = item.assets;
        }
        if (item.key === "Drift") {
          assets.driftPrepAsset = item.assets;
        }
        if (item.key === "Hyper") {
          assets.hyperLiquidAssets = item.assets;
        }
        if (item.key === "Rabbitx") {
          assets.rabbitxSymbol = item.assets;
        }
      });
    }
  } catch (e) {
    console.log("error fetching constants ", e);
  }
};

const isAssetsExist = (ary, symbol) => {
  return ary.includes(symbol);
};
module.exports = {
  assets,
  isAssetsExist,
  fetchAssets,
};
