import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

passwords = ['password123', 'rh_secret_change_me', 'postgres', 'password', 'rh_user', 'root']
users = ['rh_user', 'postgres', 'root']
ports = [5432]

for user in users:
    for pwd in passwords:
        try:
            print(f"Trying user {user} with password {pwd}...")
            conn = psycopg2.connect(
                host="127.0.0.1",
                port=5432,
                user=user,
                password=pwd,
                dbname="rh_db",
                connect_timeout=2
            )
            print(f"SUCCESS! User: {user}, Password: {pwd}")
            conn.close()
            exit(0)
        except Exception as e:
            if "database \"rh_db\" does not exist" in str(e):
                # Try connecting to postgres db first to confirm auth
                try:
                    conn = psycopg2.connect(
                        host="127.0.0.1",
                        port=5432,
                        user=user,
                        password=pwd,
                        dbname="postgres",
                        connect_timeout=2
                    )
                    print(f"AUTH SUCCESS! User: {user}, Password: {pwd} (but rh_db missing)")
                    conn.close()
                    exit(0)
                except:
                    pass
            print(f"Failed: {e}")
