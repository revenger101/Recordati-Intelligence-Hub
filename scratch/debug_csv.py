import pandas as pd
import os

manual_file = 'TBH_2026_V0_ JANV- INDUS & SPC.csv'
df = pd.read_csv(manual_file, skiprows=5, encoding='utf-8')
print("Columns found:")
print(df.columns.tolist())
print("\nFirst row:")
print(df.iloc[0].to_dict())

month_map = {
    'janv.-26': '2026-01-01', 'févr.-26': '2026-02-01', 'mars-26': '2026-03-01',
}

for col in month_map.keys():
    if col in df.columns:
        print(f"Col {col} found!")
    else:
        # Try finding it with partial match or case insensitive
        match = [c for c in df.columns if col.lower() in c.lower()]
        if match:
            print(f"Col {col} found as {match}!")
        else:
            print(f"Col {col} NOT found!")
