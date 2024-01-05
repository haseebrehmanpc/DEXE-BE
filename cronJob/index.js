const Common = require("../models/common");
const cron = require("node-cron");
const {
  getAevoassets,
  getDriftAssets,
  getHyperLiquidAssets,
  getVertexAssets,
  getRabbitxAssets,
} = require("../constant/api");
const { findCommonSymbol } = require("../utils");
const runCronJob = () => {
  // Schedule the cron job to run every day
  cron.schedule("0 0 * * *", async () => {
    console.log("Cron job is running!");

    const aveData = await getAevoassets();
    const driftData = await getDriftAssets();
    const hyperData = await getHyperLiquidAssets();
    const rabbitxData = await getRabbitxAssets();
    const VertexDataWithId = await getVertexAssets();
    const VertexData = VertexDataWithId.map((v) => v.symbol);
    if (aveData && driftData && hyperData && rabbitxData && VertexData) {
      const data = await findCommonSymbol(
        aveData,
        driftData,
        hyperData,
        rabbitxData,
        VertexData
      );
      const entities = [
        {
          key: "Vertex",
          assets: VertexDataWithId,
        },
        {
          key: "Aevo",
          assets: aveData,
        },
        {
          key: "Drift",
          assets: driftData,
        },
        {
          key: "Hyper",
          assets: hyperData,
        },
        {
          key: "Rabbitx",
          assets: rabbitxData,
        },
      ];
      const existingData = await Common.findOne({});

      if (existingData) {
        // Update operation if data exists
        const updatedData = await Common.findOneAndUpdate(
          {},
          { $set: { commonAssets: data, entities } },
          { new: true }
        );

        console.log("Updated common in db", updatedData);
      } else {
        // If data doesn't exist, create a new document
        const newData = await Common.create({ commonAssets: data, entities });
        console.log("Created new common in db", newData);
      }
    }
  });
};

module.exports = runCronJob;
