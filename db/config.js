const mongoose = require("mongoose");
const { DB_URL } = require("../config/index");
const connectToDatabase = async () => {
  try {
    const db = await mongoose.connect(DB_URL);
    console.log("Connected to MongoDB Atlas", db);
    return db;
  } catch (error) {
    console.error("Error connecting to MongoDB Atlas:", error);
    throw error;
  }
};
connectToDatabase();

// module.exports = connectToDatabase;
