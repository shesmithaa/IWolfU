let username = "";
let ws;

const loginContainer = document.getElementById("loginContainer");
const chatContainer = document.getElementById("chatContainer");
const chatbox = document.getElementById("chatbox");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const joinBtn = document.getElementById("joinBtn");
const usernameInput = document.getElementById("username");

// Join button
joinBtn.onclick = () => {
  username = usernameInput.value.trim();
  if (!username) {
    alert("Please enter a nickname!");
    return;
  }
  loginContainer.classList.add("hidden");
  chatContainer.classList.remove("hidden");
  startChat();
};

function addMessage(data) {
  const msg = document.createElement("p");
  msg.innerHTML = `<span class="user">${data.user}:</span> ${data.text}`;
  chatbox.appendChild(msg);
  chatbox.scrollTop = chatbox.scrollHeight;
}

function startChat() {
  ws = new WebSocket("wss://" + window.location.host + "/ws");

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    addMessage(data);
  };

  ws.onopen = async () => {
    const res = await fetch("/messages");
    const pastMessages = await res.json();
    pastMessages.forEach(addMessage);
  };
}

sendBtn.onclick = () => {
  if (messageInput.value.trim() !== "") {
    const messageData = { user: username, text: messageInput.value };
    ws.send(JSON.stringify(messageData));
    messageInput.value = "";
  }
};

messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendBtn.click();
});
