import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

conn = psycopg2.connect(
    host=os.getenv('POSTGRES_HOST', 'localhost'),
    port=os.getenv('POSTGRES_PORT', '5433'),
    user=os.getenv('POSTGRES_USER', 'rh_user'),
    password=os.getenv('POSTGRES_PASSWORD', 'rh_secret_change_me'),
    dbname=os.getenv('POSTGRES_DB', 'rh_db')
)
cur = conn.cursor()
cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'fact_employee'")
cols = cur.fetchall()
print(f"Columns in fact_employee: {[c[0] for c in cols]}")
cur.close()
conn.close()
