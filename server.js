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
    // Make the request to OpenAI's chat model (GPT-3.5 / GPT-4)
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", // or use gpt-4 if you have access
        messages: [
          { role: "system", content: "You are a helpful furniture assistant." },
          { role: "user", content: userMsg },
        ],
      }),
    });

    const data = await response.json();

    let reply = data.choices[0].message.content || "Sorry, I couldn't understand that.";
    res.json({ reply });
  } catch (err) {
    console.error("Error:", err.message);
    res.json({
      reply: "⚠️ Sorry, I couldn’t connect to the AI server right now. Please try again shortly.",
    });
  }
});

// Homepage
app.get("/", (req, res) => {
  res.send("🪑 AI Furniture Finder backend is running!");
});

// 🚀 Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
