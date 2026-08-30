const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);

    console.log("MongoDB connected successfully");
  } catch (err) {
    console.log("MongoDB connection failed:", err.message);
  }
};

module.exports = connectDb;