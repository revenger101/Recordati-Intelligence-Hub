import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

passwords = ['password123', 'rh_secret_change_me', 'postgres', 'password']
users = ['rh_user', 'postgres']
hosts = ['127.0.0.1', 'localhost']
ports = [5432, 5433]

for host in hosts:
    for port in ports:
        for user in users:
            for pwd in passwords:
                try:
                    print(f"Trying {host}:{port} user {user} password {pwd}...")
                    conn = psycopg2.connect(
                        host=host,
                        port=port,
                        user=user,
                        password=pwd,
                        dbname="postgres",
                        connect_timeout=1
                    )
                    print(f"SUCCESS! Host: {host}, Port: {port}, User: {user}, Password: {pwd}")
                    conn.close()
                    exit(0)
                except Exception as e:
                    pass
print("ALL FAILED")
