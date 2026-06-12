import psycopg2
import os
from dotenv import load_dotenv

load_dotenv('.env')

def check_dates():
    try:
        conn = psycopg2.connect("postgresql://rh_user:password123@localhost:5433/rh_db")
        cursor = conn.cursor()
        
        print("--- Departure Dates ---")
        cursor.execute("SELECT departure_date FROM departure_analysis;")
        rows = cursor.fetchall()
        for r in rows:
            print(r[0])
            
        print("\n--- Current Month in fact_employee ---")
        cursor.execute("SELECT MAX(updated_at) FROM fact_employee;")
        print(cursor.fetchone()[0])

        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_dates()
