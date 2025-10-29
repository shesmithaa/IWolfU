import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "sheshchat.db")

def get_conn():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_conn()
    c = conn.cursor()
    c.execute("""
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user TEXT NOT NULL,
        text TEXT NOT NULL,
        timestamp TEXT DEFAULT (datetime('now','localtime'))
    )
    """)
    conn.commit()
    conn.close()

if __name__ == '__main__':
    init_db()
