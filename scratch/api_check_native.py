import http.client
import json

def check_endpoints():
    host = "localhost"
    port = 3000
    headers = {"Authorization": "Bearer bypass"}
    
    endpoints = ["/api/analytics/monthly"]
    
    conn = http.client.HTTPConnection(host, port)
    for ep in endpoints:
        try:
            conn.request("GET", ep, headers=headers)
            r = conn.getresponse()
            print(f"Status: {r.status}")
            print("Headers:")
            for h in r.getheaders():
                print(f"  {h[0]}: {h[1]}")
            data = r.read()
            print(f"Content-type: {r.getheader('Content-Type')}")
            print(f"Preview: {data.decode()[:100]}")
        except Exception as e:
            print(f"FAILED: {e}")
    conn.close()

if __name__ == "__main__":
    check_endpoints()
