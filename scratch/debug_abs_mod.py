import pandas as pd
f = 'Abs MOD 2026.csv'
try:
    df = pd.read_csv(f, skiprows=2, encoding='utf-8')
    print(df.columns.tolist())
    print(df.head(2))
except Exception as e:
    print(f"Error: {e}")
