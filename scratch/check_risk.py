import psycopg2
import os
from dotenv import load_dotenv

load_dotenv('.env')

def check_risk():
    try:
        conn = psycopg2.connect("postgresql://rh_user:password123@localhost:5433/rh_db")
        cursor = conn.cursor()
        
        print("--- Risk Score Stats ---")
        cursor.execute("SELECT count(*), AVG(risk_score), MAX(risk_score), MIN(risk_score) FROM fact_employee WHERE risk_score IS NOT NULL;")
        res = cursor.fetchone()
        print(f"Count: {res[0]} | Avg: {res[1]} | Max: {res[2]} | Min: {res[3]}")
        
        if res[0] > 0:
            print("\n--- Top 5 Risks ---")
            cursor.execute("SELECT employee_id, risk_score FROM fact_employee ORDER BY risk_score DESC LIMIT 5;")
            for r in cursor.fetchall():
                print(f"Emp: {r[0]} | Risk: {r[1]}")
        else:
            print("No risk scores found in fact_employee.")

        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_risk()
