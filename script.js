// === ELEMENTS ===
const sendBtn = document.getElementById("sendBtn");
const userInput = document.getElementById("userInput");
const chatBox = document.getElementById("chatBox");
const openChatBtn = document.getElementById("openChatBtn");
const openChatHero = document.getElementById("openChatHero");
const chatPopup = document.getElementById("chatPopup");
const closeChat = document.getElementById("closeChat");

// === POPUP HANDLERS ===
if (openChatBtn) openChatBtn.addEventListener("click", () => chatPopup.classList.remove("hidden"));
if (openChatHero) openChatHero.addEventListener("click", (e) => { e.preventDefault(); chatPopup.classList.remove("hidden"); });
if (closeChat) closeChat.addEventListener("click", () => chatPopup.classList.add("hidden"));

// === SEND MESSAGE ===
async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  addUserMessage(text);
  userInput.value = "";

  // Add typing animation
  const typing = document.createElement("div");
  typing.classList.add("bot-msg", "typing");
  typing.innerHTML = `<span></span><span></span><span></span>`;
  chatBox.appendChild(typing);
  chatBox.scrollTop = chatBox.scrollHeight;

  // Send message to backend AI API
  try {
    const res = await fetch("https://ai-furniture-backend.onrender.com/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
    });
    

    const data = await res.json();
    typing.remove();

    addBotMessage(data.reply);
  } catch (err) {
    typing.remove();
    addBotMessage("⚠️ Sorry, I couldn’t connect to the AI server right now.");
    console.error(err);
  }
}

// === DISPLAY HELPERS ===
function addUserMessage(text) {
  const msg = document.createElement("div");
  msg.classList.add("user-msg");
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function addBotMessage(text) {
  const msg = document.createElement("div");
  msg.classList.add("bot-msg");
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// === EVENT LISTENERS ===
sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMessage();
  }
});
