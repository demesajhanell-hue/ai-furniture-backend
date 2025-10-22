import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

// 🧠 keep conversation history in memory
let conversation = [];

app.post("/api/chat", async (req, res) => {
  const userMsg = req.body.message || "";

  // add user message to conversation
  conversation.push({ role: "user", content: userMsg });

  try {
    // 🪄 call Hugging Face conversational model
    const response = await fetch(
      "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      "I'm here to help you with your furniture choices!";

    // store the assistant reply
    conversation.push({ role: "assistant", content: reply });

    // trim to last 10 messages (avoid memory overflow)
    if (conversation.length > 20) conversation = conversation.slice(-20);

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.json({
      reply:
        "⚠️ Sorry, I'm having trouble thinking right now. Please try again later.",
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
