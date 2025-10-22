import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

// 🧠 Chat route
app.post("/api/chat", async (req, res) => {
  const userMsg = req.body.message?.trim();
  if (!userMsg) {
    return res.json({ reply: "Please type something about furniture 😊" });
  }

  try {
    // ✅ Use a guaranteed public model
    const response = await fetch(
      "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: userMsg }),
      }
    );

    // Sometimes the model is still loading; handle that gracefully
    if (!response.ok) {
      const text = await response.text();
      console.error("HF response:", text);
      return res.json({ reply: "⚠️ The AI model is still loading — please try again in a few seconds." });
    }

    const data = await response.json();

    let reply =
      data?.generated_text ||
      data?.[0]?.generated_text ||
      "I'm here to help you find the perfect furniture piece!";

    res.json({ reply });
  } catch (err) {
    console.error("Error:", err.message);
    res.json({ reply: "⚠️ Could not connect to the AI server. Please try again later." });
  }
});

// Home route
app.get("/", (req, res) => {
  res.send("🪑 AI Furniture Finder backend is running!");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
