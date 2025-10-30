let username = "";
let ws;
let avatarUrl = ""; // add this line

const loginContainer = document.getElementById("loginContainer");
const chatContainer = document.getElementById("chatContainer");
const chatbox = document.getElementById("chatbox");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const joinBtn = document.getElementById("joinBtn");
const usernameInput = document.getElementById("username");
const usersList = document.getElementById("usersList"); // add this if you plan to show online users

// Join button
joinBtn.onclick = () => {
  username = usernameInput.value.trim();
  if (!username) {
    alert("Please enter a nickname!");
    return;
  }

  // ✅ Generate a unique avatar for this user
  avatarUrl = `https://api.dicebear.com/9.x/pixel-art/svg?seed=${encodeURIComponent(username)}`;

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

// ✅ Updated version of startChat()
function startChat() {
  // Updated WebSocket path includes username and avatar
  ws = new WebSocket(
    "wss://" +
      window.location.host +
      `/ws/${encodeURIComponent(username)}/${encodeURIComponent(avatarUrl)}`
  );

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    // If we receive a user list update
    if (data.type === "user_list") {
      updateUserList(data.users);
    }
    // If we receive a chat message
    else if (data.type === "message") {
      addMessage(data.data);
    }
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

// ✅ Optional: function to show online users (pfp + name)
function updateUserList(users) {
  if (!usersList) return;
  usersList.innerHTML = "";
  users.forEach((u) => {
    const userDiv = document.createElement("div");
    userDiv.classList.add("user-item");
    userDiv.innerHTML = `
      <img src="${u.avatar}" class="avatar">
      <span>${u.name}</span>
    `;
    usersList.appendChild(userDiv);
  });
}
