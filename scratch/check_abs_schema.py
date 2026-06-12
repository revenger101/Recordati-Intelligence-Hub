import psycopg2
import os

def check_schema():
    conn = psycopg2.connect("postgresql://rh_user:password123@localhost:5433/rh_db")
    cursor = conn.cursor()
    cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'fact_absence';")
    print([c[0] for c in cursor.fetchall()])
    conn.close()

if __name__ == "__main__":
    check_schema()
