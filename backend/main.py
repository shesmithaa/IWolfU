from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import json, os

app = FastAPI()

# ---------- Serve frontend ----------
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

CHAT_FILE = "messages.json"


# ---------- Utilities ----------
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


# ---------- Chat Manager ----------
class ConnectionManager:
    def __init__(self):
        self.users = {}  # username -> {"ws": websocket, "avatar": url}

    async def connect(self, websocket: WebSocket, username: str, avatar: str):
        await websocket.accept()
        self.users[username] = {"ws": websocket, "avatar": avatar}
        await self.broadcast_user_list()

    def disconnect(self, username: str):
        if username in self.users:
            del self.users[username]

    async def broadcast_user_list(self):
        users = [{"name": u, "avatar": info["avatar"]} for u, info in self.users.items()]
        for info in self.users.values():
            await info["ws"].send_json({"type": "user_list", "users": users})

    async def broadcast_message(self, msg: dict):
        for info in self.users.values():
            await info["ws"].send_json({"type": "message", "data": msg})

    async def broadcast_reaction(self, reaction: dict):
        for info in self.users.values():
            await info["ws"].send_json({"type": "reaction", **reaction})


manager = ConnectionManager()


# ---------- WebSocket Endpoint ----------
import base64

@app.websocket("/ws/{username}/{avatar}")
async def websocket_endpoint(websocket: WebSocket, username: str, avatar: str):
    avatar = base64.b64decode(avatar).decode()  # decode safely
    await manager.connect(websocket, username, avatar)


    try:
        while True:
            data = await websocket.receive_json()

            if data.get("type") == "reaction":
                await manager.broadcast_reaction(data)
                continue

            messages = load_messages()
            messages.append(data)
            save_messages(messages)
            await manager.broadcast_message(data)

    except WebSocketDisconnect:
        manager.disconnect(username)
        await manager.broadcast_user_list()
