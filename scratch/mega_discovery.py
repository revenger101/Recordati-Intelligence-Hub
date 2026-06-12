import pandas as pd
import glob
import os
import re

def clean_mat(m):
    if pd.isnull(m): return None
    s = str(m).strip()
    if s.endswith('.0'): s = s[:-2]
    if re.match(r'^\d+$', s):
        return s.zfill(5)
    return None

all_discovered_mats = set()

# Scan current dir
for f in glob.glob('*.csv'):
    try:
        df = pd.read_csv(f, encoding='latin-1', on_bad_lines='skip', sep=None, engine='python', nrows=500)
        for col in df.columns:
            mats = df[col].apply(clean_mat).dropna().unique()
            all_discovered_mats.update(mats)
    except: pass

# Scan UPLOADS dir (Aggressive)
for f in glob.glob('uploads/*.csv'):
    try:
        df = pd.read_csv(f, encoding='latin-1', on_bad_lines='skip', sep=None, engine='python', nrows=200)
        for col in df.columns:
            mats = df[col].apply(clean_mat).dropna().unique()
            all_discovered_mats.update(mats)
    except: pass

print(f"GRAND TOTAL UNIQUE MATRICULES (including Uploads): {len(all_discovered_mats)}")
