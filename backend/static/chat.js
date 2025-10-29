const API_URL = "http://127.0.0.1:8000";
const chatBox = document.getElementById("chat-box");
const usernameInput = document.getElementById("username");
const messageInput = document.getElementById("message");
const sendBtn = document.getElementById("send-btn");

async function loadMessages() {
  try {
    const res = await fetch(`${API_URL}/messages`);
    if (!res.ok) throw new Error('Network error');
    const messages = await res.json();
    chatBox.innerHTML = '';
    for (const m of messages) {
      const div = document.createElement('div');
      div.className = 'message ' + ((m.user === (usernameInput.value||'').trim()) ? 'me' : 'other');
      const meta = document.createElement('div');
      meta.className = 'meta';
      meta.textContent = `${m.user} • ${m.timestamp || ''}`;
      div.appendChild(meta);
      const body = document.createElement('div');
      body.innerHTML = `<div>${escapeHtml(m.text)}</div>`;
      div.appendChild(body);
      chatBox.appendChild(div);
    }
    chatBox.scrollTop = chatBox.scrollHeight;
  } catch (e) {
    console.warn('Could not load messages', e);
  }
}

function escapeHtml(unsafe) {
  return unsafe
       .replaceAll('&', '&amp;')
       .replaceAll('<', '&lt;')
       .replaceAll('>', '&gt;')
       .replaceAll('"', '&quot;')
       .replaceAll("'", '&#039;');
}

sendBtn.addEventListener('click', async () => {
  const user = (usernameInput.value||'').trim();
  const text = (messageInput.value||'').trim();
  if (!user || !text) return;
  try {
    await fetch(`${API_URL}/send`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({user, text})
    });
    messageInput.value = '';
    loadMessages();
  } catch (e) {
    console.warn('Send failed', e);
  }
});

// auto-refresh
setInterval(loadMessages, 2000);
loadMessages();
