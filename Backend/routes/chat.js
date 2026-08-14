import express from "express";
import mongoose from "mongoose";
import Thread from "../models/Thread.js";
import getOpenAIAPIResponse from "../utils/openai.js";

const router = express.Router();

// Middleware to check database connection
const checkDbConnection = (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        console.warn("MongoDB is not connected. Operation cannot proceed.");
        return res.status(503).json({
            error: "Database is not connected. Please add a valid MONGODB_URI (MongoDB Atlas) to your Render environment variables."
        });
    }
    next();
};

// Test route
router.post("/test", checkDbConnection, async (req, res) => {
    try {
        const thread = new Thread({
            threadId: "abc",
            title: "Testing New Thread"
        });

        const response = await thread.save();
        return res.status(201).json(response);
    } catch (err) {
        console.error("Test route error:", err);
        return res.status(500).json({ error: "Failed to save in DB" });
    }
});

// Get all threads (sorted by most recently updated)
router.get("/thread", checkDbConnection, async (req, res) => {
    try {
        const threads = await Thread.find({}).sort({ updatedAt: -1 });
        return res.status(200).json(threads);
    } catch (err) {
        console.error("Error fetching threads:", err);
        return res.status(500).json({ error: "Failed to fetch threads" });
    }
});

// Get messages for a specific thread
router.get("/thread/:threadId", checkDbConnection, async (req, res) => {
    const { threadId } = req.params;

    try {
        const thread = await Thread.findOne({ threadId });

        if (!thread) {
            return res.status(404).json({ error: "Thread not found" });
        }

        return res.status(200).json(thread.messages);
    } catch (err) {
        console.error(`Error fetching thread ${threadId}:`, err);
        return res.status(500).json({ error: "Failed to fetch chat" });
    }
});

// Delete a specific thread
router.delete("/thread/:threadId", checkDbConnection, async (req, res) => {
    const { threadId } = req.params;

    try {
        const deletedThread = await Thread.findOneAndDelete({ threadId });

        if (!deletedThread) {
            return res.status(404).json({ error: "Thread not found" });
        }

        return res.status(200).json({ success: "Thread deleted successfully", threadId });
    } catch (err) {
        console.error(`Error deleting thread ${threadId}:`, err);
        return res.status(500).json({ error: "Failed to delete thread" });
    }
});

// Post a chat message
router.post("/chat", async (req, res) => {
    const { threadId, message } = req.body;

    if (!threadId || !message || !message.trim()) {
        return res.status(400).json({ error: "Thread ID and non-empty message are required" });
    }

    const trimmedMessage = message.trim();

    try {
        // 1. Get AI completion first
        const assistantReply = await getOpenAIAPIResponse(trimmedMessage);

        // 2. Persist to DB if connected
        if (mongoose.connection.readyState === 1) {
            try {
                let thread = await Thread.findOne({ threadId });

                if (!thread) {
                    const title = trimmedMessage.length > 50
                        ? `${trimmedMessage.substring(0, 47)}...`
                        : trimmedMessage;

                    thread = new Thread({
                        threadId,
                        title,
                        messages: [{ role: "user", content: trimmedMessage }]
                    });
                } else {
                    thread.messages.push({ role: "user", content: trimmedMessage });
                }

                thread.messages.push({
                    role: "assistant",
                    content: assistantReply || "I am sorry, but I could not generate a response."
                });
                thread.updatedAt = new Date();

                await thread.save();
            } catch (dbErr) {
                console.error("Database save failed:", dbErr.message);
            }
        } else {
            console.warn("MongoDB not connected; responding without DB persistence.");
        }

        return res.status(200).json({ reply: assistantReply, threadId });
    } catch (err) {
        console.error("Error in /chat endpoint:", err);
        return res.status(500).json({ error: "Something went wrong while processing chat" });
    }
});

export default router;