import psycopg2
import os
from dotenv import load_dotenv

load_dotenv('.env')

DB_HOST = os.getenv('POSTGRES_HOST', 'localhost')
DB_PORT = os.getenv('POSTGRES_PORT', '5433')
DB_USER = os.getenv('POSTGRES_USER', 'rh_user')
DB_PASS = os.getenv('POSTGRES_PASSWORD', 'rh_secret_change_me')
DB_NAME = os.getenv('POSTGRES_DB', 'rh_db')

conn_string = f"host={DB_HOST} port={DB_PORT} dbname={DB_NAME} user={DB_USER} password={DB_PASS}"

try:
    conn = psycopg2.connect(conn_string)
    cur = conn.cursor()
    cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'fact_employee' ORDER BY ordinal_position")
    cols = [r[0] for r in cur.fetchall()]
    print(cols)
    conn.close()
except Exception as e:
    print(e)
