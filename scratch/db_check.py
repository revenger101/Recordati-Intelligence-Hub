import psycopg2
import os

def check_db():
    try:
        # Use credentials from .env
        conn = psycopg2.connect("postgresql://rh_user:password123@localhost:5433/rh_db")
        cursor = conn.cursor()
        
        print("--- Table Existence & Population ---")
        cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';")
        tables = cursor.fetchall()
        for t in tables:
            cursor.execute(f"SELECT count(*) FROM {t[0]};")
            count = cursor.fetchone()[0]
            print(f"Table: {t[0]} | Count: {count}")
            
        print("\n--- Metadata & Sync Status ---")
        try:
           cursor.execute("SELECT * FROM etl_metadata;")
           rows = cursor.fetchall()
           for r in rows:
               print(f"{r[0]}: {r[1]}")
        except: print("Metadata table not reachable yet.")
            
        print("\n--- Departure Analysis Check ---")
        try:
           cursor.execute("SELECT name, value FROM (SELECT factor as name, count(*) as value FROM departure_analysis GROUP BY factor) sub ORDER BY value DESC;")
           rows = cursor.fetchall()
           for r in rows:
               print(f"Factor: {r[0]} | Count: {r[1]}")
        except: print("Departure analysis table not found or empty.")

        conn.close()
    except Exception as e:
        print(f"DB Check Error: {e}")

if __name__ == "__main__":
    check_db()
