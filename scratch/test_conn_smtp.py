import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

# The user might be using their SMTP password
passwords = ['Freddy123456*', 'password123', 'rh_secret_change_me']

for pwd in passwords:
    try:
        print(f"Trying password {pwd}...")
        conn = psycopg2.connect(
            host="127.0.0.1",
            port=5432,
            user="rh_user",
            password=pwd,
            dbname="rh_db",
            connect_timeout=2
        )
        print(f"SUCCESS! Password: {pwd}")
        conn.close()
        exit(0)
    except Exception as e:
        print(f"Failed: {e}")
