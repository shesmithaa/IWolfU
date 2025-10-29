from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import json
import os

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


# ---------- CHAT MANAGER ----------
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            await connection.send_json(message)


manager = ConnectionManager()


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_json()
            messages = load_messages()
            messages.append(data)
            save_messages(messages)
            await manager.broadcast(data)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
