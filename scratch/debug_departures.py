import http.client
import json

def check_departures():
    conn = http.client.HTTPConnection("localhost", 3000)
    headers = {"Authorization": "Bearer bypass"}
    conn.request("GET", "/api/analytics/monthly", headers=headers)
    r = conn.getresponse()
    data = json.loads(r.read().decode())
    
    print("--- Monthly Stats Debug ---")
    for row in data:
        if int(row['departures']) > 0:
            print(f"Month: {row['label']} | Headcount: {row['headcount']} | Departures: {row['departures']}")
    conn.close()

if __name__ == "__main__":
    check_departures()
