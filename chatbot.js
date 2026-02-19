const model = "gemini-2.5-flash"
// const key = "AIzaSyAXTu-0tJxSAc52qzl5TBUFnqY5NPO2JSU" 
import {GAK} from '.env'

console.log("hi")
const key = GAK

const chatbox = document.getElementById("chatbox");
const chatIcon = document.getElementById("chatIcon");
const closeChat = document.getElementById("closeChat");
const messages = document.getElementById("messages");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
//const flag = false



let hasWelcomed = false;
console.log("hello")
function openChat() {
  chatbox.classList.add("open");
  chatbox.setAttribute("aria-hidden", "false");
console.log("open", chatbox)
  if (!hasWelcomed) {
    addBot("How can I assist you?");
    hasWelcomed = true;
    console.log("welcome")
  }
  setTimeout(() => input.focus(), 50);
}

function closechatbox() {
  console.log("close")
  chatbox.classList.remove("open");
  chatbox.setAttribute("aria-hidden", "true");
}


function toggleChat() {

  if (chatbox.classList.contains("open")) {
    console.log("toggle")
    closechatbox()}
  else openChat();
}

chatIcon.addEventListener("click", toggleChat());
closeChat.addEventListener("click", closechatbox());



function addBot(){

}

// function openChat(){
//   console.log("open")
//   messages.classList.add("open")
//   messages.setAttribute("aria-hidden", "false")
//   if (!flag){
//     addBot("Hi, How can I help you?")
//     flag = true
//   } 
//   setTimeout (()=>{input.focus()}, 40)
// }

// input.addEventListener("keydown", (e) => {
//   if (e.key === "Enter") sendMessage();
//   console.log("sending")
// });

sendBtn.addEventListener("click", sendMessage);

function addMsg(role, text) {
  const bubble = document.createElement("div");
  bubble.className = `msg ${role}`;
  bubble.textContent = text;

  const meta = document.createElement("div");
  meta.className = "msg-meta";
  meta.textContent = role === "user" ? "You" : "AI";

  bubble.appendChild(meta);
  messages.appendChild(bubble);
  messages.scrollTop = messages.scrollHeight;
  console.log(text)
}

function addUser(text) { addMsg("user", text); }
function addBot(text) { addMsg("bot", text); }

function setSending(isSending) {
  sendBtn.disabled = isSending;
  input.disabled = isSending;
  sendBtn.textContent = isSending ? "..." : "Send";
}

async function sendMessage() {
  const userText = input.value.trim();
  if (!userText) return;

  addUser(userText);
  input.value = "";
  setSending(true);

  try {
// Small “system style” instruction: keep answers crisp and structured
    const prompt =
      `You are a helpful assistant for a personal finance tracker named SmartSpend.
Give crisp, practical advice.
Use short bullet points.
If user asks for a plan, give a 3-step plan.
User question: ${userText}`;

    const reply = await callGemini(prompt, key);
    addBot(reply || "I couldn't generate a reply. Try again.");
  } catch (err) {
    addBot(`Error: ${err?.message || String(err)}`);
  } finally {
    setSending(false);
  }
}
async function callGemini(text, key) {
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;

  const body = {
    contents: [
      { parts: [{ text }] }
    ]
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
console.log(res)
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Gemini API error ${res.status}: ${errText || res.statusText}`);
  }

  const data = await res.json();
console.log(data)
  // Typical response shape: candidates[0].content.parts[0].text :contentReference[oaicite:4]{index=4}
  const out =
    data?.candidates?.[0]?.content?.parts
      ?.map(p => p?.text || "")
      .join("")
      .trim();

  return out;
}

input.addEventListener("keydown",(e)=>{
  if (e.key === "Enter")
    sendMessage()
  
})

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
// async function sendMessage() {
//   const text = input.value.trim();
//   if (!text) return;
  

//   addMessage(text, "user");
//   input.value = "";

//   const typing = document.createElement("div");
//   typing.className = "msg bot";
//   typing.textContent = "Typing...";
//   messages.appendChild(typing);

//   try {
//     const res = await fetch("/api/chat", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ message: text })
//     });

//     const data = await res.json();
//     typing.remove();

//     if (!res.ok) {
//       addMessage(data.error || "Error occurred", "bot");
//       return;
//     }

//     addMessage(data.reply, "bot");

//   } catch (e) {
//     typing.remove();
//     addMessage("Network error", "bot");
//   }
// }

async function sendMessage() {
  const userText = input.value.trim();
  console.log(userText)
  if (!userText) return;

  addUser(userText);
  input.value = "";
  setSending(true);

  try {

    // Small “system style” instruction: keep answers crisp and structured
    const prompt =
      `You are a helpful assistant for a personal finance app named SmartSpend.
Give crisp, practical advice.
Use short bullet points when possible.
If user asks for a plan, give a 3-4 step plan.
User question: ${userText}`;

    const reply = await callGemini(prompt, key);
    console.log(reply)
    addBot(reply || "I couldn't generate a reply. Try again.");
  } catch (err) {
    addBot(`Error: ${err?.message || String(err)}`);
  } finally {
    setSending(false);
  }
}


async function callGemini(text){
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`
  const res = await fetch(url,{
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      contents: [{
        parts: [{text: text}]
      }]
    })
  })
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Gemini API error ${res.status}: ${errText || res.statusText}`);
  }
  const data = await res.json();
  console.log(data) 

  // Typical response shape: candidates[0].content.parts[0].text :contentReference[oaicite:4]{index=4}
  const out =
    data?.candidates?.[0]?.content?.parts
      ?.map(p => p?.text || "")
      .join("")
      .trim();

  return out;
}