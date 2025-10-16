from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import json, os
from .database import init_db, get_conn
from .models import Message

app = FastAPI(title="IWolfU - Shesh Chat (backend)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change this in production
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_FILE = os.path.join(os.path.dirname(__file__), "sheshchat.db")
init_db()  # ensure database + table

@app.get("/messages")
def get_messages():
    conn = get_conn()
    c = conn.cursor()
    rows = c.execute("SELECT id, user, text, timestamp FROM messages ORDER BY id ASC").fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.post("/send")
async def send_message(msg: Message):
    conn = get_conn()
    c = conn.cursor()
    c.execute("INSERT INTO messages (user, text) VALUES (?, ?)", (msg.user, msg.text))
    conn.commit()
    conn.close()
    return {"status": "ok"}

@app.get("/")
def root():
    return {"status": "IWolfU backend running"}
