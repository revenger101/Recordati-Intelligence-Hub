import pandas as pd
import json
import os

path = r'c:\Users\USER\Desktop\PFE BA\Project 2\Indicateurs RH.xlsx'
if os.path.exists(path):
    # Try reading first sheet
    df = pd.read_excel(path)
    print("Columns:", df.columns.tolist())
    print("Head:\n", df.head(10).to_string())
    
    # Save as CSV for easier future access
    df.to_csv(r'c:\Users\USER\Desktop\PFE BA\Project 2\Indicateurs_RH_Extracted.csv', index=False)
else:
    print("File not found")
