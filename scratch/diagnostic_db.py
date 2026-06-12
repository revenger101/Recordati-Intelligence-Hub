import psycopg2
import os
from dotenv import load_dotenv

load_dotenv('.env')
DB_HOST = os.getenv('POSTGRES_HOST', 'localhost')
DB_PORT = os.getenv('POSTGRES_PORT', '5433')
DB_USER = os.getenv('POSTGRES_USER', 'rh_user')
DB_PASS = os.getenv('POSTGRES_PASS', 'rh_pass')
DB_NAME = os.getenv('POSTGRES_DB', 'opalia_hr')

def check():
    try:
        conn = psycopg2.connect(host=DB_HOST, port=DB_PORT, user=DB_USER, password=DB_PASS, dbname=DB_NAME)
        curr = conn.cursor()
        
        queries = {
            "Total Employees": "SELECT count(*) FROM fact_employee",
            "Employees with Age": "SELECT count(*) FROM fact_employee WHERE age IS NOT NULL",
            "Employees with Seniority": "SELECT count(*) FROM fact_employee WHERE anciennete_annees IS NOT NULL",
            "Sorted Employees": "SELECT count(*) FROM fact_employee WHERE statut = 'SORTANT'",
            "Departure Analysis Records": "SELECT count(*) FROM departure_analysis",
            "Distinct Depts": "SELECT count(DISTINCT departement) FROM fact_employee",
            "KPI Records": "SELECT count(*) FROM company_kpis"
        }
        
        print("--- DATABASE DIAGNOSTIC ---")
        for name, sql in queries.items():
            curr.execute(sql)
            count = curr.fetchone()[0]
            print(f"{name:25}: {count}")
            
        curr.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check()
