"""
OpaliaHR — One-shot DB fix + ETL launcher
==========================================
After resetting rh_user password in pgAdmin, run:
    python scratch/fix_and_run_etl.py
This will:
1. Verify the DB connection
2. Update .env with correct credentials
3. Launch the full Star Schema ETL
"""
import psycopg2, sys, os, subprocess
from pathlib import Path

ROOT = Path(__file__).parent.parent
ENV_FILE = ROOT / ".env"

# ── Step 1: Find working connection ──────────────────────────────────────────
PASSWORDS = ["password123", "rh_secret_change_me", "admin", "rh_user", "1234"]
PORT = 5432

print("=" * 55)
print("  OpaliaHR — DB Fix & ETL Launcher")
print("=" * 55)
print(f"\n[1/3] Testing DB connection on port {PORT}...")

working_pw = None
for pw in PASSWORDS:
    try:
        c = psycopg2.connect(
            host="127.0.0.1", port=PORT,
            user="rh_user", password=pw,
            dbname="rh_db", connect_timeout=3
        )
        c.cursor().execute("SELECT 1")
        c.close()
        working_pw = pw
        print(f"      Connected with password: {pw}")
        break
    except psycopg2.OperationalError as e:
        err = str(e).splitlines()[0][:60]
        print(f"      FAIL pw={pw}: {err}")

if not working_pw:
    print("\n[ERROR] Cannot connect to rh_user@rh_db.")
    print("\nPlease reset the password first:")
    print("  1. Open pgAdmin 4")
    print("  2. Right-click rh_db database -> Query Tool")
    print("  3. Run:  ALTER USER rh_user WITH PASSWORD 'password123';")
    print("  4. Re-run this script")
    sys.exit(1)

# ── Step 2: Update .env ───────────────────────────────────────────────────────
print(f"\n[2/3] Updating .env with verified credentials...")
env_content = ENV_FILE.read_text(encoding="utf-8")

def set_env(content, key, value):
    import re
    pattern = rf"^{key}=.*$"
    replacement = f"{key}={value}"
    if re.search(pattern, content, re.MULTILINE):
        return re.sub(pattern, replacement, content, flags=re.MULTILINE)
    return content + f"\n{key}={value}\n"

env_content = set_env(env_content, "POSTGRES_PASSWORD", working_pw)
env_content = set_env(env_content, "POSTGRES_PORT", str(PORT))
env_content = set_env(env_content, "POSTGRES_HOST", "127.0.0.1")
ENV_FILE.write_text(env_content, encoding="utf-8")
print(f"      .env updated: POSTGRES_PASSWORD={working_pw}, POSTGRES_PORT={PORT}")

# ── Step 3: Run the ETL ───────────────────────────────────────────────────────
print(f"\n[3/3] Launching Star Schema ETL...")
print("-" * 55)
result = subprocess.run(
    [sys.executable, str(ROOT / "scripts" / "star_schema_etl.py")],
    cwd=str(ROOT)
)
print("-" * 55)
if result.returncode == 0:
    print("\nETL COMPLETE. Database is loaded.")
else:
    print(f"\nETL exited with code {result.returncode}. Check output above.")
