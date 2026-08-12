// backend/config/db.js
const mongoose = require("mongoose");

async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    console.error(`Continuing server startup (Auth routes will fail but Verification will work)`);
    // process.exit(1);
  }
}

module.exports = connectDB;
