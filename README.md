# IWolfU — SheshChat (SQLite + Dark mode)

## What this is
A tiny private chat app (frontend + FastAPI backend) that stores messages in a local SQLite database.
This package is ready to upload to GitHub and deploy (Render / Replit) or run locally.

## Run locally
1. Open two terminals.

Terminal A — backend:
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload
```
Backend will run at `http://127.0.0.1:8000`.

Terminal B — frontend:
```bash
cd frontend
python -m http.server 5500
```
Open `http://127.0.0.1:5500` in your browser.

## Deploy
- Upload repository to GitHub and deploy backend to Render or Replit. Make sure backend start command points to `backend.main:app`.
- Update `frontend/chat.js` `API_URL` to the public backend URL once deployed.

## Notes
- Database file `sheshchat.db` is created in `backend/` automatically.
- This is intended for learning and private use; for production you should add authentication and tighten CORS.
