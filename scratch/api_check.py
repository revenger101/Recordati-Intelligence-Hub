import requests
import json

def check_endpoints():
    base_url = "http://localhost:3001/api"
    headers = {"Authorization": "Bearer bypass"}
    
    endpoints = [
        "/analytics/monthly",
        "/analytics/turnover-reasons",
        "/etl/status",
        "/employees"
    ]
    
    print("--- API Health Check ---")
    for ep in endpoints:
        try:
            r = requests.get(base_url + ep, headers=headers)
            print(f"Endpoint: {ep} | Status: {r.status_code} | Size: {len(r.text)} bytes")
            if r.status_code != 200:
                print(f"  Error: {r.text}")
            elif ep == "/etl/status":
                print(f"  Payload: {r.json()}")
        except Exception as e:
            print(f"Endpoint: {ep} | FAILED: {e}")

if __name__ == "__main__":
    check_endpoints()
