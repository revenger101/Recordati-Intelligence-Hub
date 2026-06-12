import requests
import time
import pandas as pd
import os

BASE_URL = "http://localhost:3000/api"

endpoints = [
    "/analytics/command-center",
    "/employees",
    "/analytics/monthly",
    "/etl/mapping-report",
    "/analytics/payroll/summary"
]

def benchmark_api():
    print("=== OpaliaHR System Benchmark v1.0 ===")
    results = []
    for ep in endpoints:
        start = time.time()
        try:
            resp = requests.get(BASE_URL + ep, timeout=5)
            duration = time.time() - start
            status = "OK" if resp.status_code == 200 else f"ERROR {resp.status_code}"
            results.append({"endpoint": ep, "status": status, "time_ms": int(duration * 1000)})
        except Exception as e:
            results.append({"endpoint": ep, "status": f"FAILED: {str(e)}", "time_ms": -1})
    
    df = pd.DataFrame(results)
    print("\nAPI Performance Report:")
    print(df.to_string(index=False))
    
    # Check Data Warehouse Integrity
    print("\n--- Data Warehouse Integrity Check ---")
    dw_files = ["Dim_Employee.csv", "Fact_Absence.csv", "Fact_Turnover.csv"]
    for f in dw_files:
        path = f"DataWarehouse/{f}"
        if os.path.exists(path):
            size = os.path.getsize(path)
            rows = len(pd.read_csv(path))
            print(f"✅ {f}: {rows} rows ({size} bytes)")
        else:
            print(f"❌ {f}: MISSING")

if __name__ == "__main__":
    benchmark_api()
