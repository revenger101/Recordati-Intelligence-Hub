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

tables = ['dim_employee', 'dim_department', 'fact_employee', 'fact_absence', 'fact_turnover', 'fact_recruitment']
for t in tables:
    cur.execute(f"SELECT COUNT(*) FROM {t}")
    count = cur.fetchone()[0]
    print(f"Table {t}: {count} records")

cur.close()
conn.close()
