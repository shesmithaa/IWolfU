from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import json, os

app = FastAPI()

# Serve frontend
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

CHAT_FILE = "messages.json"

# ---------- UTILITIES ----------
def load_messages():
    if not os.path.exists(CHAT_FILE):
        with open(CHAT_FILE, "w") as f:
            json.dump([], f)
    with open(CHAT_FILE, "r") as f:
        return json.load(f)

def save_messages(messages):
    with open(CHAT_FILE, "w") as f:
        json.dump(messages, f)


@app.get("/", response_class=HTMLResponse)
async def get(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/messages")
async def get_messages():
    return load_messages()


# ---------- IMPROVED CHAT MANAGER (with user list + avatars) ----------
class ConnectionManager:
    def __init__(self):
        # username -> {"ws": WebSocket, "avatar": str}
        self.users = {}

    async def connect(self, websocket: WebSocket, username: str, avatar: str):
        await websocket.accept()
        self.users[username] = {"ws": websocket, "avatar": avatar}
        await self.broadcast_user_list()

    def disconnect(self, username: str):
        if username in self.users:
            del self.users[username]

    async def broadcast_user_list(self):
        users = [{"name": name, "avatar": data["avatar"]} for name, data in self.users.items()]
        for data in self.users.values():
            await data["ws"].send_json({"type": "user_list", "users": users})

    async def broadcast_message(self, msg):
        for data in self.users.values():
            await data["ws"].send_json({"type": "message", "data": msg})


manager = ConnectionManager()

@app.websocket("/ws/{username}/{avatar}")
async def websocket_endpoint(websocket: WebSocket, username: str, avatar: str):
    # 👇 This line must come FIRST
    await websocket.accept()

    # Then register the connection with manager
    await manager.connect(websocket, username, avatar)

    try:
        while True:
            data = await websocket.receive_json()

            # Handle emoji reactions
            if data.get("type") == "reaction":
                await manager.broadcast_message(data)
                continue

            # Save chat messages
            messages = load_messages()
            messages.append(data)
            save_messages(messages)

            # Broadcast new message
            await manager.broadcast_message(data)

    except WebSocketDisconnect:
        manager.disconnect(username)
        await manager.broadcast_user_list()


