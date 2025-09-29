import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import coursesRoutes from "./routes/courses.js";
import roomsRoutes from "./routes/rooms.js";
import challengesRoutes from "./routes/challenges.js";
// import roomsRoutes from "./routes/rooms.js";
dotenv.config();

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/skillloops";
mongoose.connect(mongoUri).then(()=>console.log("Mongo connected")).catch(console.error);

// routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/courses", coursesRoutes);
app.use("/api/v1/rooms", roomsRoutes);
app.use("/api/v1/challenges", challengesRoutes);
app.use("/api/v1/rooms", roomsRoutes);



app.get("/api/v1/health", (req,res)=> res.json({ ok: true }));

export default app;