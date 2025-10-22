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
    const response = await fetch(
      "https://api-inference.huggingface.co/models/microsoft/DialoGPT-small",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: userMsg }),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("HF response:", text);
      return res.json({
        reply: "⚠️ The AI model might still be starting — please try again shortly.",
      });
    }

    const data = await response.json();
    const reply =
      data?.generated_text ||
      data?.[0]?.generated_text ||
      "🪑 I can help you pick furniture — can you describe what you’re looking for?";

    res.json({ reply });
  } catch (err) {
    console.error("Error:", err.message);
    res.json({
      reply:
        "⚠️ Sorry, I couldn’t connect to the AI model right now. Please try again shortly.",
    });
  }
});

// Homepage
app.get("/", (req, res) => {
  res.send("🪑 AI Furniture Finder backend is running!");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
