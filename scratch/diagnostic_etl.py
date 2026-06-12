import pandas as pd
import os

master_file = 'ETAT DU PERSO.csv'
df_raw = pd.read_csv(master_file, sep=',', on_bad_lines='skip', nrows=20)
header_row = 0
for i, row in df_raw.iterrows():
    row_str = " ".join(str(x) for x in row.values).upper()
    if 'MAT' in row_str or 'FONCTION' in row_str:
        header_row = i
        break

df = pd.read_csv(master_file, skiprows=header_row, on_bad_lines='skip')
df.columns = [str(c).strip().upper() for c in df.columns]
m_col = next((c for c in df.columns if 'MAT' in c), None)
print(f"Header row: {header_row}")
print(f"M_COL: {m_col}")
print(f"First 10 values of {m_col}:")
print(df[m_col].head(10).tolist())
