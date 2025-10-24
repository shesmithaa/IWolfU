from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from models import Message
from database import init_db, get_conn
import os

app = FastAPI(title="IWolfU - Shesh Chat Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

@app.get("/")
def serve_frontend():
    return FileResponse(os.path.join("frontend", "index.html"))

@app.get("/messages")
def get_messages():
    conn = get_conn()
    c = conn.cursor()
    rows = c.execute("SELECT id, user, text, timestamp FROM messages ORDER BY id ASC").fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.post("/send")
def send_message(msg: Message):
    conn = get_conn()
    c = conn.cursor()
    c.execute("INSERT INTO messages (user, text) VALUES (?, ?)", (msg.user, msg.text))
    conn.commit()
    conn.close()
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=10000)
