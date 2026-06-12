import psycopg2
import os
from dotenv import load_dotenv

load_dotenv('.env')
DB_HOST = os.getenv('POSTGRES_HOST', 'localhost')
DB_PORT = os.getenv('POSTGRES_PORT', '5433')
DB_USER = os.getenv('POSTGRES_USER', 'rh_user')
DB_PASS = os.getenv('POSTGRES_PASSWORD', 'password123')
DB_NAME = os.getenv('POSTGRES_DB', 'rh_db')

def check():
    try:
        conn = psycopg2.connect(host=DB_HOST, port=DB_PORT, user=DB_USER, password=DB_PASS, dbname=DB_NAME)
        curr = conn.cursor()
        curr.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'fact_employee'")
        cols = [c[0] for c in curr.fetchall()]
        print(f"Columns: {cols}")
        curr.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check()
