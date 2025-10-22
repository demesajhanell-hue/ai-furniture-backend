import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

// 🧠 Route for chat
app.post("/api/chat", async (req, res) => {
  const userMsg = req.body.message?.trim() || "";

  if (!userMsg) {
    return res.json({ reply: "Please type something about furniture 😊" });
  }

  try {
    // ✅ Connect to Hugging Face BlenderBot model
    const response = await fetch(
      "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
        },
        body: JSON.stringify({
          inputs: userMsg, // simple text input
        }),
      }
    );

    const data = await response.json();

    // 🪑 Pick the AI's generated reply
    const reply =
      data?.generated_text ||
      data?.[0]?.generated_text ||
      "I'm here to help you choose the right furniture!";

    res.json({ reply });
  } catch (err) {
    console.error("Error:", err);
    res.json({
      reply:
        "⚠️ Sorry, I couldn’t connect to the AI server right now. Please try again shortly.",
    });
  }
});

// 🌐 Homepage
app.get("/", (req, res) => {
  res.send("🪑 AI Furniture Finder backend is running!");
});

// 🚀 Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
