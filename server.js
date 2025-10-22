import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

let conversation = [];

// 🧠 Route for chat
app.post("/api/chat", async (req, res) => {
  const userMsg = req.body.message?.trim() || "";

  if (!userMsg) {
    return res.json({ reply: "Please type something about furniture 😊" });
  }

  conversation.push({ role: "user", content: userMsg });

  try {
    // ✅ make sure you added HF_API_KEY in Render environment variables
    const response = await fetch(
      "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
        },
        body: JSON.stringify({
          inputs: {
            past_user_inputs: conversation
              .filter((m) => m.role === "user")
              .map((m) => m.content),
            generated_responses: conversation
              .filter((m) => m.role === "assistant")
              .map((m) => m.content),
            text: userMsg,
          },
        }),
      }
    );

    const data = await response.json();

    let reply =
      data?.generated_text ||
      data?.[0]?.generated_text ||
      "🪑 I can help you pick furniture — can you describe what you need?";

    conversation.push({ role: "assistant", content: reply });

    if (conversation.length > 20) conversation = conversation.slice(-20);

    res.json({ reply });
  } catch (err) {
    console.error("Error:", err);
    res.json({
      reply:
        "⚠️ Sorry, I couldn’t connect to the AI server right now. Please try again shortly.",
    });
  }
});

// Optional: homepage
app.get("/", (req, res) => {
  res.send("🪑 AI Furniture Finder backend is running!");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
