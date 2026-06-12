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
    cur.execute("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'predictions_log')")
    exists = cur.fetchone()[0]
    print(exists)
    if not exists:
        print("Creating table predictions_log...")
        cur.execute("""
            CREATE TABLE predictions_log (
                id SERIAL PRIMARY KEY,
                employee_id VARCHAR(64),
                probabilite_turnover NUMERIC(5,4),
                probabilite_turnover_pct INT,
                niveau_risque VARCHAR(20),
                facteurs_risque TEXT,
                date_prediction DATE DEFAULT CURRENT_DATE
            );
        """)
        conn.commit()
        print("Table created.")
    conn.close()
except Exception as e:
    print(e)
