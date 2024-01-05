const { default: axios } = require("axios");

const getVertexAssets = async () => {
  try {
    const res = await axios.get(
      "https://gateway.prod.vertexprotocol.com/v1/query?type=symbols&product_type=perp"
    );
    if (res?.status === 200) {
      if (!res?.data?.data?.symbols) return;
      const objectkeys = Object.keys(res?.data?.data?.symbols);
      const objectsres = objectkeys.map((key) => ({
        symbol: res?.data?.data?.symbols[key]?.symbol.split("-")[0],
        product_id: res?.data?.data?.symbols[key]?.product_id,
      }));
      if (objectsres.length) return objectsres;
    }
    return null;
  } catch (e) {
    console.log("error in getVertexAssets method :", e);
    return null;
  }
};

const getAevoassets = async () => {
  try {
    const res = await axios.get("https://api.aevo.xyz/assets");
    return res?.data ? res?.data : null;
  } catch (e) {
    console.log("error in getAevoassets method :", e);
    return null;
  }
};

const getDriftAssets = async () => {
  try {
    const res = await axios.get(
      "https://mainnet-beta.api.drift.trade/markets24h"
    );
    if (res?.data?.data?.length) {
      const data = res.data.data
        .map((data) => data.symbol)
        ?.filter((value) => value.includes("PERP"));
      if (data.length) {
        return data.map((item) => item.split("-")[0]);
      }
    }
    return null;
  } catch (e) {
    console.log("error in getDriftAssets method :", e);
    return null;
  }
};
const getRabbitxAssets = async () => {
  try {
    const res = await axios.get("https://api.prod.rabbitx.io/markets?");

    if (res?.data?.result.length) {
      const data = res.data?.result?.map((data) => data.base_currency);
      return data;
    }

    return null;
  } catch (e) {
    console.log("error in getRabbitxAssets method :", e);
    return null;
  }
};
const getHyperLiquidAssets = async () => {
  try {
    const res = await axios.post("https://api.hyperliquid.xyz/info", {
      type: "meta",
    });

    if (res?.data?.universe?.length) {
      const data = res.data.universe.map((item) => item.name);
      return data;
    }
    return null;
  } catch (e) {
    console.log("error in getHyperLiquidAssets method :", e);
    return null;
  }
};

module.exports = {
  getAevoassets,
  getDriftAssets,
  getHyperLiquidAssets,
  getVertexAssets,
  getRabbitxAssets,
};
