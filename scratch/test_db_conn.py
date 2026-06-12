import psycopg2
from dotenv import load_dotenv
import os

load_dotenv()

DB_CONFIG = {
    "host": os.getenv("POSTGRES_HOST", "127.0.0.1"),
    "port": "5432",
    "user": "rh_user",
    "password": "password123",
    "dbname": "rh_db"
}

print(f"Connecting to {DB_CONFIG['host']}:{DB_CONFIG['port']}...")
try:
    conn = psycopg2.connect(**DB_CONFIG)
    print("Connection Successful!")
    conn.close()
except Exception as e:
    print(f"Connection Failed: {e}")
