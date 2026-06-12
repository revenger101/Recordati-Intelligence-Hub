import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

def clean_database_strings():
    print("[CLEANER] Starting Database Text Normalization...")
    try:
        conn = psycopg2.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            port=os.getenv('DB_PORT', '5433'),
            user=os.getenv('DB_USER', 'rh_user'),
            password=os.getenv('DB_PASS', 'password123'),
            dbname=os.getenv('DB_NAME', 'rh_db')
        )
        cur = conn.cursor()

        # Fix specific Mojibake patterns
        replacements = [
            ("dâ\x80\x99", "d'"),
            ("â\x80\x9d", "'"),
            ("â\x80\x9c", "'"),
            ("â\x80\x93", "-"),
            ("â\x80\xa6", "..."),
            ("â\x80\xa2", "."),
            ("Ã©", "é"),
            ("Ã ", "à"),
            ("Ã¨", "è"),
            ("Ãª", "ê"),
            ("Ã«", "ë"),
            ("Ã®", "î"),
            ("Ã¯", "ï"),
            ("Ã´", "ô"),
            ("Ã»", "û"),
            ("Ã¹", "ù"),
            ("Ã§", "ç"),
            ("â\x80\xa5", ": "), # Found in screenshot
            ("dâ\x80\x99", "d'") # Duplicate but safe
        ]

        # Tables to clean
        tables = [('company_kpis', 'indicator_name'), ('company_kpis', 'objective'), ('fact_employee', 'poste'), ('fact_employee', 'departement')]

        for table, column in tables:
            print(f"   -> Cleaning {table}.{column}...")
            for bad, good in replacements:
                cur.execute(f"""
                    UPDATE {table} 
                    SET {column} = REPLACE({column}, %s, %s) 
                    WHERE {column} LIKE %s
                """, (bad, good, f'%{bad}%'))
        
        conn.commit()
        print("[CLEANER] Database strings normalized successfully.")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"[ERR] Cleanup failed: {e}")

if __name__ == "__main__":
    clean_database_strings()
