import pandas as pd
import json
import os

def extract_indicators(file_path):
    if not os.path.exists(file_path):
        print(f"Error: {file_path} not found")
        return
    
    try:
        # Load the Excel file
        xls = pd.ExcelFile(file_path)
        data = {}
        for sheet_name in xls.sheet_names:
            df = xls.parse(sheet_name)
            data[sheet_name] = df.to_dict(orient='records')
        
        # Save to a temporary JSON file for the agent to read
        output_path = os.path.join(os.getcwd(), 'indicators_data.json')
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"Successfully extracted data to indicators_data.json")
        print("Sheet names:", xls.sheet_names)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    extract_indicators('Indicateurs RH.xlsx')
