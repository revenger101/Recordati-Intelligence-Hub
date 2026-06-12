import pandas as pd
import glob
import re

def clean_mat(m):
    if pd.isnull(m): return None
    s = str(m).strip()
    if s.endswith('.0'): s = s[:-2]
    if re.match(r'^\d+$', s):
        return s.zfill(5)
    return None

mats_2026 = set()
files_2026 = [f for f in glob.glob('*.csv') if '2026' in f or 'Journal' in f or 'Act (' in f]

for f in files_2026:
    try:
        df = pd.read_csv(f, encoding='latin-1', on_bad_lines='skip', sep=None, engine='python')
        for col in df.columns:
            m = df[col].apply(clean_mat).dropna().unique()
            mats_2026.update(m)
    except: pass

print(f"2026 UNIQUE ACTIVE HEADCOUNT: {len(mats_2026)}")
