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
    cursor.execute("SELECT indicator_name, month_year, value FROM company_kpis LIMIT 10;")
    rows = cursor.fetchall()
    print("KPIs in DB:")
    for row in rows:
        print(row)
    cursor.execute("SELECT employee_id, risk_score FROM fact_employee LIMIT 5;")
    rows = cursor.fetchall()
    print("\nEmployee Risk Scores:")
    for row in rows:
        print(row)
    conn.close()
except Exception as e:
    print(f"Error: {e}")
