// backend/src/db.js
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/skillloops";

export async function connectDB() {
  try {
    await mongoose.connect(mongoUri, {
      // options (modern mongoose defaults many of these)
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("MongoDB connected");
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB error:", err);
    });
    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected");
    });

    // graceful shutdown
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("MongoDB connection closed due to app termination");
      process.exit(0);
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    throw err;
  }
}