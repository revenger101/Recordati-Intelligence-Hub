import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

passwords = ['password123', 'rh_secret_change_me', 'postgres', 'password', 'rh_user']
ports = [5432, 5433]

for port in ports:
    for pwd in passwords:
        try:
            print(f"Trying port {port} with password {pwd}...")
            conn = psycopg2.connect(
                host="127.0.0.1",
                port=port,
                user="rh_user",
                password=pwd,
                dbname="rh_db",
                connect_timeout=3
            )
            print(f"SUCCESS! Port: {port}, Password: {pwd}")
            conn.close()
            exit(0)
        except Exception as e:
            print(f"Failed: {e}")
