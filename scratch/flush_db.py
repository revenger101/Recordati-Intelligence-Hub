import psycopg2
import os
from dotenv import load_dotenv

load_dotenv('.env')

def flush_all():
    try:
        conn = psycopg2.connect(
            dbname=os.getenv('POSTGRES_DB', 'rh_db'),
            user=os.getenv('POSTGRES_USER', 'rh_user'),
            password=os.getenv('POSTGRES_PASSWORD', 'password123'),
            host=os.getenv('POSTGRES_HOST', 'localhost'),
            port=os.getenv('POSTGRES_PORT', '5433')
        )
        cursor = conn.cursor()
        
        tables = ['fact_absence', 'fact_employee', 'departure_analysis', 'etl_metadata', 'predictions_log']
        print(f"Starting Flash Flush of {len(tables)} tables...")
        
        for t in tables:
            cursor.execute(f"TRUNCATE TABLE {t} CASCADE;")
            print(f"  [FLUSH] Table {t} wiped.")
            
        conn.commit()
        cursor.close()
        conn.close()
        print("\n[SUCCESS] OpaliaHR Data Warehouse is now empty. Ready for ETL stress test.")
        
    except Exception as e:
        print(f"[ERROR] Flush failed: {e}")

if __name__ == "__main__":
    flush_all()
