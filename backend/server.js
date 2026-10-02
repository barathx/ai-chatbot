const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const OpenAI = require("openai");

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Render provides PORT automatically.
// Locally it will use 3000.
const PORT = process.env.PORT || 3000;

// -----------------------------
// Middleware
// -----------------------------

app.use(cors());
app.use(express.json());

// -----------------------------
// Check NVIDIA API key
// -----------------------------

if (!process.env.NVIDIA_API_KEY) {
  console.error("❌ NVIDIA_API_KEY is missing.");
  console.error("Please add NVIDIA_API_KEY to your environment variables.");
  process.exit(1);
}

// -----------------------------
// NVIDIA NIM Client
// -----------------------------

const client = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: "https://integrate.api.nvidia.com/v1",
});

// -----------------------------
// Root Route
// -----------------------------

app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "AI Text Backend is running",
    provider: "NVIDIA NIM",
  });
});

// -----------------------------
// Health Check
// -----------------------------

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "AI backend is running",
    provider: "NVIDIA NIM",
    model: "nvidia/nemotron-3.5-lightning-30b-a3b",
  });
});

// -----------------------------
// AI Chat API
// -----------------------------

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    // Validate message
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: "Please enter a message.",
      });
    }

    console.log("\n-----------------------------");
    console.log("User:", message);
    console.log("Sending request to NVIDIA NIM...");

    // Call NVIDIA NIM
    const completion = await client.chat.completions.create({
      model: "nvidia/nemotron-3.5-lightning-30b-a3b",

      messages: [
        {
          role: "system",
          content:
            "You are a helpful AI assistant. Answer clearly and concisely. Avoid unnecessary long explanations.",
        },
        {
          role: "user",
          content: message.trim(),
        },
      ],

      temperature: 0.7,

      // Keep responses short for faster generation
      max_tokens: 250,
    });

    // Get AI response
    const reply = completion.choices?.[0]?.message?.content;

    if (!reply) {
      throw new Error("No response received from NVIDIA NIM.");
    }

    console.log("AI:", reply);
    console.log("-----------------------------\n");

    // Send response to frontend
    res.json({
      success: true,
      reply: reply,
    });
  } catch (error) {
    console.error("\n❌ NVIDIA API Error:");
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Failed to get response from NVIDIA NIM.",
      details: error.message,
    });
  }
});

// -----------------------------
// 404 Handler
// -----------------------------

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// -----------------------------
// Global Error Handler
// -----------------------------

app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);

  res.status(500).json({
    success: false,
    error: "Internal server error.",
  });
});

// -----------------------------
// Start Server
// -----------------------------

app.listen(PORT, "0.0.0.0", () => {
  console.log("");
  console.log("=================================");
  console.log("🚀 AI Backend Started");
  console.log("=================================");
  console.log(`📡 Port: ${PORT}`);
  console.log(`❤️  Health: /api/health`);
  console.log("🤖 Provider: NVIDIA NIM");
  console.log("🧠 Model: Nemotron 3.5 Lightning");
  console.log("=================================");
  console.log("");
});