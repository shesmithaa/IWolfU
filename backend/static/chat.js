let username = "";
let ws;
let avatarUrl = "";

const loginContainer = document.getElementById("loginContainer");
const chatContainer = document.getElementById("chatContainer");
const chatbox = document.getElementById("chatbox");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const joinBtn = document.getElementById("joinBtn");
const usernameInput = document.getElementById("username");
const usersList = document.getElementById("usersList");

// -------------------- JOIN CHAT --------------------
joinBtn.onclick = () => {
  username = usernameInput.value.trim();
  if (!username) {
    alert("Please enter a nickname!");
    return;
  }

  // ✅ Generate a pixel-art avatar using DiceBear
  avatarUrl = `https://api.dicebear.com/9.x/pixel-art/svg?seed=${encodeURIComponent(
    username
  )}`;

  loginContainer.classList.add("hidden");
  chatContainer.classList.remove("hidden");
  startChat();
};

// -------------------- ADD MESSAGE --------------------
function addMessage(data) {
  const msg = document.createElement("p");
  msg.classList.add("message");

  // Optional reactions placeholder
  const reactions = `
    <span class="reactions">
      <button onclick="sendReaction('👍','${data.user}')">👍</button>
      <button onclick="sendReaction('❤️','${data.user}')">❤️</button>
      <button onclick="sendReaction('😂','${data.user}')">😂</button>
    </span>
  `;

  msg.innerHTML = `<span class="user">${data.user}:</span> ${data.text} ${reactions}`;
  chatbox.appendChild(msg);
  chatbox.scrollTop = chatbox.scrollHeight;
}

// -------------------- WEBSOCKET HANDSHAKE --------------------
function startChat() {
  const wsProtocol = window.location.protocol === "https:" ? "wss://" : "ws://";

  ws = new WebSocket(
    wsProtocol +
      window.location.host +
      `/ws/${encodeURIComponent(username)}/${encodeURIComponent(avatarUrl)}`
  );

  ws.onopen = async () => {
    console.log("Connected to WebSocket ✅");
    const res = await fetch("/messages");
    const pastMessages = await res.json();
    pastMessages.forEach(addMessage);
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "user_list") {
      updateUserList(data.users);
    } else if (data.type === "message") {
      addMessage(data.data);
    } else if (data.type === "reaction") {
      showReaction(data);
    }
  };

  ws.onclose = () => {
    console.warn("Disconnected from server ❌");
  };
}

// -------------------- SEND MESSAGE --------------------
sendBtn.onclick = () => {
  const text = messageInput.value.trim();
  if (!text) return;

  const messageData = { user: username, text: text };
  ws.send(JSON.stringify(messageData));
  messageInput.value = "";
};

messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendBtn.click();
});

// -------------------- SHOW ONLINE USERS --------------------
function updateUserList(users) {
  if (!usersList) return;
  usersList.innerHTML = "";

  const title = document.createElement("h3");
  title.textContent = "Online";
  title.style.color = "#ff2e2e";
  usersList.appendChild(title);

  users.forEach((u) => {
    const div = document.createElement("div");
    div.classList.add("user-item");
    div.innerHTML = `
      <img class="avatar" src="${u.avatar}" alt="avatar" />
      <span>${u.name}</span>
    `;
    usersList.appendChild(div);
  });
}

// -------------------- REACTIONS --------------------
function sendReaction(emoji, toUser) {
  const data = {
    type: "reaction",
    emoji: emoji,
    to: toUser,
    from: username,
  };
  ws.send(JSON.stringify(data));
}

function showReaction(data) {
  const msg = document.createElement("p");
  msg.innerHTML = `<span class="user">${data.from}</span> reacted ${data.emoji} to ${data.to}`;
  msg.style.fontStyle = "italic";
  msg.style.color = "#ff6666";
  chatbox.appendChild(msg);
  chatbox.scrollTop = chatbox.scrollHeight;
}
