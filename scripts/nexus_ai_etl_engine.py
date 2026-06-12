import pandas as pd
import os
import glob
import json
import re
from datetime import datetime
from difflib import SequenceMatcher

class NexusAIETL:
    def __init__(self, schema_path, source_dir, target_dir):
        with open(schema_path, 'r') as f:
            self.schema = json.load(f)
        self.source_dir = source_dir
        self.target_dir = target_dir
        self.dim_employee_path = os.path.join(target_dir, "Dim_Employee.csv")
        self.memory_path = os.path.join(os.path.dirname(schema_path), "mapping_memory.json")
        self.load_memory()

    def load_memory(self):
        if os.path.exists(self.memory_path):
            with open(self.memory_path, 'r') as f:
                self.memory = json.load(f)
        else:
            self.memory = {}

    def save_memory(self):
        with open(self.memory_path, 'w') as f:
            json.dump(self.memory, f, indent=2)

    def similarity(self, a, b):
        return SequenceMatcher(None, str(a).upper(), str(b).upper()).ratio()

    def identify_table_type(self, df, filename):
        """AI-like logic to identify which target table a source file belongs to."""
        headers = [str(c).upper() for c in df.columns]
        filename = filename.upper()

        # Patterns
        if "PERSO" in filename or any(x in " ".join(headers) for x in ["MATRICULE", "NOM", "PRENOM", "GENRE"]):
            return "Dim_Employee"
        if "TPS" in filename or any(x in " ".join(headers) for x in ["MALADIE", "ABSENCE", "CP"]):
            return "Fact_Absence"
        if "SORTANT" in filename or "DEPARTURE" in filename:
            return "Fact_Turnover"
        if "PAIE" in filename or "SALAIRE" in filename:
            return "Fact_Employee_Snapshot"
        
        return None

    def smart_map_columns(self, table_type, source_cols, target_cols):
        """Semantically maps source columns to target columns with memory."""
        mapping = {}
        
        # Special logic for Fact_Absence: multiple source columns can map to duration_days
        if table_type == "Fact_Absence":
            duration_sources = [c for c in source_cols if any(x in c.upper() for x in ["MALADIE", "CP", "ABSENCE", "ABS", "MATERNITE", "MI-TEMPS"])]
            if duration_sources:
                mapping["duration_days"] = duration_sources
                target_cols = [t for t in target_cols if t != "duration_days"]

        # Check memory for others
        if table_type in self.memory:
            for t_col, s_col in self.memory[table_type].items():
                if t_col in mapping: continue
                if isinstance(s_col, list):
                    if all(sc in source_cols for sc in s_col): mapping[t_col] = s_col
                elif s_col in source_cols:
                    mapping[t_col] = s_col

        for t_col in target_cols:
            if t_col in mapping: continue
            
            best_match = None
            highest_score = 0
            for s_col in source_cols:
                score = self.similarity(s_col, t_col)
                # Boost specific known synonyms
                synonyms = {
                    "full_name": ["NOM", "PRENOM", "NOM & PRENOM", "EMPLOYEE", "SALARIE"],
                    "matricule": ["MAT", "MAT.", "ID", "CODE", "MATRICULE"],
                    "gender": ["GENRE", "SEXE", "M/F"],
                    "department": ["SERVICE", "DEP", "DEPARTEMENT", "DIRECTION"],
                    "date_fk": ["DATE", "MOIS", "JOUR", "PERIOD"],
                    "duration_days": ["NB JOURS", "DUREE", "MALADIE", "CP", "ABSENCE"]
                }
                if t_col in synonyms:
                    for syn in synonyms[t_col]:
                        if syn in str(s_col).upper():
                            score += 0.5
                
                if score > highest_score:
                    highest_score = score
                    best_match = s_col
            
            if highest_score > 0.5:
                mapping[t_col] = best_match

        # Update memory if we found new reliable mappings
        if table_type not in self.memory: self.memory[table_type] = {}
        self.memory[table_type].update(mapping)
        self.save_memory()
        
        return mapping

    def process_file(self, file_path):
        print(f"--- Analyzing: {os.path.basename(file_path)} ---")
        try:
            # Try different encodings
            df = None
            for enc in ['utf-8', 'latin1', 'cp1252']:
                try:
                    df = pd.read_csv(file_path, encoding=enc, sep=None, engine='python')
                    break
                except: continue
            
            if df is None: return

            # Clean headers (remove leading/trailing spaces, noise)
            df.columns = [str(c).strip() for c in df.columns]
            
            table_type = self.identify_table_type(df, os.path.basename(file_path))
            if not table_type:
                print(f"Could not identify table type for {file_path}")
                return

            print(f"Identified as: {table_type}")
            target_cols = self.schema[table_type]["required_columns"]
            mapping = self.smart_map_columns(table_type, df.columns, target_cols)
            
            print(f"Smart Mapping: {mapping}")

            # Transform
            transformed_df = pd.DataFrame()
            for t_col, s_col in mapping.items():
                if isinstance(s_col, list):
                    # Sum multiple columns (e.g. different absence types)
                    temp_sum = pd.Series(0, index=df.index)
                    for sc in s_col:
                        # Clean numeric data (handle commas, spaces, NaN)
                        clean_col = df[sc].astype(str).str.replace(',', '.').str.replace(' ', '')
                        temp_sum += pd.to_numeric(clean_col, errors='coerce').fillna(0)
                    transformed_df[t_col] = temp_sum
                else:
                    transformed_df[t_col] = df[s_col]

            # Custom Logic per Table Type
            if table_type == "Dim_Employee":
                if 'matricule' in transformed_df.columns:
                    transformed_df.drop_duplicates(subset=['matricule'], keep='last', inplace=True)
                transformed_df['employee_sk'] = range(1, len(transformed_df) + 1)
                transformed_df['employment_status'] = 'Active'
            
            elif table_type == "Fact_Absence":
                # Handle date_fk from filename if not in columns
                if 'date_fk' not in transformed_df.columns or transformed_df['date_fk'].isnull().all():
                    date_match = re.search(r'(JANV|FEVR|MARS|AVRIL|MAI|JUIN|JUIL|AOUT|SEPT|OCT|NOV|DEC).*?(202\d)', os.path.basename(file_path).upper())
                    if date_match:
                        month_map = {"JANV": "01", "FEVR": "02", "MARS": "03", "AVRIL": "04", "MAI": "05", "JUIN": "06", "JUIL": "07", "AOUT": "08", "SEPT": "09", "OCT": "10", "NOV": "11", "DEC": "12"}
                        transformed_df['date_fk'] = f"{date_match.group(2)}{month_map[date_match.group(1)]}15"
                
                # Link to Employee SK
                if os.path.exists(self.dim_employee_path):
                    dim_emp = pd.read_csv(self.dim_employee_path)
                    # We need matricule to join
                    mat_col = next((c for c in df.columns if 'MATRICULE' in c.upper() or 'MAT.' in c.upper()), None)
                    if mat_col:
                        df[mat_col] = df[mat_col].astype(str)
                        dim_emp['matricule'] = dim_emp['matricule'].astype(str)
                        merged = transformed_df.merge(dim_emp[['matricule', 'employee_sk']], left_on=mapping.get('matricule', mat_col), right_on='matricule', how='left')
                        transformed_df['employee_fk'] = merged['employee_sk']
                        if 'matricule' in transformed_df.columns: transformed_df.drop(columns=['matricule'], inplace=True)

            # Save
            target_path = os.path.join(self.target_dir, f"{table_type}.csv")
            if os.path.exists(target_path):
                # Append if it's a Fact table, Overwrite if Dim (simplified for now)
                if "Fact" in table_type:
                    existing = pd.read_csv(target_path)
                    combined = pd.concat([existing, transformed_df]).drop_duplicates()
                    combined.to_csv(target_path, index=False)
                else:
                    transformed_df.to_csv(target_path, index=False)
            else:
                transformed_df.to_csv(target_path, index=False)

            print(f"Successfully processed and saved to {target_path}")

        except Exception as e:
            print(f"Error processing {file_path}: {e}")

    def run(self):
        files = glob.glob(os.path.join(self.source_dir, "*.csv"))
        for f in files:
            self.process_file(f)

if __name__ == "__main__":
    PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    source = os.path.join(PROJECT_ROOT, 'CSV')
    target = os.path.join(PROJECT_ROOT, 'DataWarehouse')
    schema = os.path.join(PROJECT_ROOT, 'scripts', 'dw_schema.json')
    
    etl = NexusAIETL(schema, source, target)
    etl.run()
