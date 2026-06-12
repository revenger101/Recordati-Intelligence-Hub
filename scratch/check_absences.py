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
    cursor = conn.cursor()
    cursor.execute("""
        SELECT date_trunc('month', date_absence) as m, SUM(duree_jours) 
        FROM fact_absence 
        WHERE EXTRACT(YEAR FROM date_absence) = 2026
        GROUP BY m 
        ORDER BY m;
    """)
    rows = cursor.fetchall()
    print("Absences in 2026 by month:")
    for row in rows:
        print(row)
    conn.close()
except Exception as e:
    print(f"Error: {e}")
