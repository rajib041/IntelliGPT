import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js";

const app = express();
const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/intelligpt";

app.use(express.json());
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Root route
app.get("/", (req, res) => {
    res.status(200).json({
        name: "IntelliGPT API",
        status: "running",
        database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
        timestamp: new Date().toISOString()
    });
});

// Health check with DB status
app.get("/api/health", (req, res) => {
    const isDbConnected = mongoose.connection.readyState === 1;
    res.status(200).json({
        status: "ok",
        database: isDbConnected ? "connected" : "disconnected",
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// API chat routes
app.use("/api", chatRoutes);

const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log("Connected to MongoDB successfully!");
    } catch (err) {
        console.error("Failed to connect to MongoDB:", err.message);
    }
};

app.listen(PORT, "0.0.0.0", async () => {
    console.log(`Server running on port ${PORT}`);
    await connectDB();
});
