from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import os

from database import init_db, get_conn

app = FastAPI()

# Initialize database
init_db()

# Serve static frontend files
app.mount("/static", StaticFiles(directory="frontend"), name="static")

# Serve index.html on root
@app.get("/")
def serve_home():
    return FileResponse(os.path.join("frontend", "index.html"))

# Example backend route
@app.get("/api")
def root_api():
    return {"status": "IWolfU backend running fine!"}

# Example chat route (if you had one)
@app.post("/chat")
def chat(message: str):
    # Replace this with your real logic later
    return {"reply": f"Shesh said: {message}"}
