const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

module.exports = {
  RBT_API_KEY: process.env.RBT_API_KEY,
  METAMASK_PRIVATE_KEY: process.env.METAMASK_PRIVATE_KEY,
  AEVO_URL: process.env.AEVO_URL,
  HYPERLINK_URL: process.env.HYPERLINK_URL,
  RABBITX_URL: process.env.RABBITX_URL,
  VERTEX_URL: process.env.VERTEX_URL,
  DRIFT_URL: process.env.DRIFT_URL,
  RABBITX_API_URL: process.env.RABBITX_API_URL,
  DB_URL: process.env.DB_URL,
};
