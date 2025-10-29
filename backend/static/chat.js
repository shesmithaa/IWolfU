const ws = new WebSocket("wss://" + window.location.host + "/ws");
const chatbox = document.getElementById("chatbox");
const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

ws.onmessage = (event) => {
  const msg = document.createElement("p");
  msg.textContent = event.data;
  chatbox.appendChild(msg);
  chatbox.scrollTop = chatbox.scrollHeight;
};

sendBtn.onclick = () => {
  if (input.value.trim() !== "") {
    ws.send(input.value);
    input.value = "";
  }
};

input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendBtn.click();
});
