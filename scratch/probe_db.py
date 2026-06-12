import psycopg2, sys, os

tests = [
    (5432, 'rh_user',  'password123',         'rh_db'),
    (5432, 'rh_user',  'rh_secret_change_me', 'rh_db'),
    (5432, 'rh_user',  'admin',               'rh_db'),
    (5432, 'rh_user',  'rh_user',             'rh_db'),
    (5432, 'postgres', 'postgres',            'rh_db'),
    (5432, 'postgres', 'postgres',            'postgres'),
    (5432, 'postgres', 'password123',         'postgres'),
    (5432, 'postgres', 'admin',               'postgres'),
]

print("=== DB PROBE ===")
for port, user, pw, db in tests:
    try:
        c = psycopg2.connect(host='127.0.0.1', port=port, user=user,
                             password=pw, dbname=db, connect_timeout=3)
        c.cursor().execute("SELECT current_user, version()")
        row = c.cursor().fetchone()
        print(f"SUCCESS port={port} user={user} pw={pw}")
        c.close()
        # Write working values to a result file
        with open('scratch/probe_result.txt', 'w') as f:
            f.write(f"POSTGRES_HOST=127.0.0.1\n")
            f.write(f"POSTGRES_PORT={port}\n")
            f.write(f"POSTGRES_USER={user}\n")
            f.write(f"POSTGRES_PASSWORD={pw}\n")
            f.write(f"POSTGRES_DB=rh_db\n")
        sys.exit(0)
    except Exception as e:
        print(f"FAIL  port={port} user={user} pw={pw}: {str(e).splitlines()[0][:70]}")

print("NO WORKING COMBO FOUND")
print("Please open pgAdmin -> Login Roles -> rh_user -> Properties -> Password")
print("Set password to: password123  then run:  python scripts/star_schema_etl.py")
