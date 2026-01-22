const chatbox = document.getElementById("chatbox");
const chatIcon = document.getElementById("chatIcon");
const closeChat = document.getElementById("closeChat");
const messages = document.getElementById("messages");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

/* Toggle chat */
chatIcon.onclick = () => chatbox.classList.toggle("open");
closeChat.onclick = () => chatbox.classList.remove("open");

/* Add message */
function addMessage(text, type) {
  const div = document.createElement("div");
  div.className = `msg ${type}`;
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

/* Initial message */
addMessage("How can I help you?", "bot");

/* Send message */
async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, "user");
  input.value = "";

  const typing = document.createElement("div");
  typing.className = "msg bot";
  typing.textContent = "Typing...";
  messages.appendChild(typing);

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });

    const data = await res.json();
    typing.remove();

    if (!res.ok) {
      addMessage(data.error || "Error occurred", "bot");
      return;
    }

    addMessage(data.reply, "bot");

  } catch (e) {
    typing.remove();
    addMessage("Network error", "bot");
  }
}

sendBtn.onclick = sendMessage;
input.onkeydown = (e) => {
  if (e.key === "Enter") sendMessage();
};
