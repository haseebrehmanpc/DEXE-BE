const { default: mongoose } = require("mongoose");

const { Schema } = mongoose;

const commonAssetsSchema = new Schema({
  commonAssets: [String],
  entities: [Schema.Types.Mixed],
});

const Common = mongoose.model("commonAsset", commonAssetsSchema);

module.exports = Common;
