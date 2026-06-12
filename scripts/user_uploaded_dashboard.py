import io
import os
import re
import sqlite3
import tempfile
from datetime import datetime

import numpy as np
import pandas as pd
import plotly.express as px
import streamlit as st
from fuzzywuzzy import fuzz

# Mapping definitions for target schema fields
TARGET_TABLES = {
    "Dim_Date": ["date_key", "date", "year", "month", "day", "quarter", "weekday"],
    "Dim_Employee": ["employee_key", "full_name", "gender", "department", "position", "hire_date", "termination_date", "tenure_months", "salary", "status"],
    "Dim_Department": ["department_key", "department_name"],
    "Dim_Position": ["position_key", "position_name"],
    "Fact_Turnover": ["employee_key", "date_key", "turnover_type", "reason"],
    "Fact_Absence": ["employee_key", "date_key", "absence_type", "absence_days"],
    "Fact_Recruitment": ["employee_key", "hire_date_key", "time_to_hire_days", "probation_months", "cost"],
    "Fact_Employee_Snapshot": ["employee_key", "date_key", "worked_hours", "headcount_flag"],
    "features_for_attrition": ["employee_key", "date_key", "tenure_months", "salary", "total_absence_days_last_year", "turnover_flag"],
    "RiskScores": ["employee_key", "date_key", "risk_probability", "risk_level", "model_name"],
}

COLUMN_SYNONYMS = {
    "employee_key": ["EMPLOYEEKEY", "EMPLOYEE ID", "EMP ID", "EMPID", "MATRICULE", "ID", "CODE", "NUMERO", "REFERENCE"],
    "full_name": ["FULL NAME", "NAME", "EMPLOYEE NAME", "NOM", "NOM PRENOM", "NOM & PRENOM", "NOM ET PRENOM"],
    "gender": ["GENDER", "SEXE", "GENRE", "M/F"],
    "department": ["DEPARTMENT", "DEPT", "SERVICE", "DEPARTEMENT", "DIRECTION", "DIVISION", "TEAM"],
    "position": ["POSITION", "JOB TITLE", "POSTE", "FONCTION", "ROLE", "JOB"],
    "hire_date": ["HIRE DATE", "DATE EMBAUCHE", "DATE HIRE", "DATE_RECRUITMENT", "DATE EMBauche", "DATE D'EMBAUCHE"],
    "termination_date": ["TERMINATION DATE", "DATE DEPART", "DATE DEPARTURE", "DATE FIN", "DATE QUIT"],
    "tenure_months": ["TENURE", "TENUREMONTHS", "ANCIENNETE", "SENIORITY", "ANCIENNETE MOIS", "ANCIENNETE_MOIS"],
    "salary": ["SALARY", "MONTHLYSALARY", "REMUNERATION", "SALARIÉ", "SALAIRE", "PAY"],
    "status": ["STATUS", "EMPLOYMENT STATUS", "STATUT", "ACTIF", "ACTIVE", "EMPLOYED"],
    "turnover_type": ["TURNOVER TYPE", "TYPE DEPART", "TYPE", "REASON TYPE", "LEAVE TYPE"],
    "reason": ["REASON", "MOTIF", "CAUSE", "DEPARTURE REASON"],
    "date_key": ["DATEKEY", "DATE KEY", "TRANSACTIONDATE", "DATE"],
    "absence_type": ["ABSENCE TYPE", "TYPE ABSENCE", "TYPE ABS", "MOTIF ABSENCE"],
    "absence_days": ["ABSENCE DAYS", "DAYS ABSENT", "DUREE_JOURS", "NBRJOURS", "NB JOURS", "ABSENCE"],
    "time_to_hire_days": ["TIME TO HIRE", "DELAI RECRUTEMENT", "JOURS AVANT EMBauche"],
    "probation_months": ["PROBATION", "PROBATION MONTHS", "MOIS PROBATION"],
    "cost": ["COST", "COUT", "RECRUITMENT COST", "COUT RECRUTEMENT"],
    "worked_hours": ["WORKED HOURS", "HOURS WORKED", "HEURES TRAVAILLEES", "HEURES"],
    "headcount_flag": ["HEADCOUNT", "HEADCOUNT FLAG", "IS ACTIVE", "ACTIF", "PRESENT"],
    "total_absence_days_last_year": ["TOTAL ABSENCE DAYS", "ABSENCE LAST YEAR", "NB ABSENCE", "NB JOURS ABSENCE"],
    "turnover_flag": ["TURNOVER FLAG", "LEAVE", "QUIT", "DEPARTURE", "PARTI", "DEPART"],
}

TABLE_KEYWORDS = {
    "Dim_Employee": ["EMPLOYEE", "COLLABORATEUR", "MATRICULE", "NOM", "PRENOM", "SERVICE", "FONCTION"],
    "Fact_Turnover": ["TURNOVER", "DEPARTURE", "SORTANT", "QUIT", "DEPART"],
    "Fact_Absence": ["ABSENCE", "ARRÊT", "CONGES", "DUREE", "NB JOURS", "ABS"],
    "Fact_Recruitment": ["RECRUITMENT", "EMBAUCHE", "HIRE", "COUT", "PROBATION", "TIME TO HIRE"],
    "Fact_Employee_Snapshot": ["SNAPSHOT", "HEADCOUNT", "WORKED HOURS", "HEURES", "PRESENT", "STATUT"],
    "features_for_attrition": ["ATTRITION", "RISK", "FEATURES", "TURNOVER FLAG", "TENURE", "SALARY"],
}

PAGES = [
    "Overview",
    "Turnover",
    "Absence",
    "Recruitment",
    "Productivity",
    "Training",
    "Diversity",
    "People Care",
    "Prediction",
]

st.set_page_config(page_title="User Upload HR Dashboard", layout="wide")


@st.cache_data(show_spinner=False)
def read_data_file(uploaded_file):
    name = uploaded_file.name.lower()
    try:
        if name.endswith(".csv"):
            return pd.read_csv(uploaded_file, engine="python", sep=None, on_bad_lines="skip", encoding="utf-8")
        if name.endswith(".xls") or name.endswith(".xlsx"):
            return pd.read_excel(uploaded_file, engine="openpyxl")
    except Exception:
        try:
            return pd.read_csv(uploaded_file, engine="python", sep=None, on_bad_lines="skip", encoding="latin1")
        except Exception:
            return pd.DataFrame()
    return pd.DataFrame()


def normalize_column_name(name):
    if name is None:
        return ""
    value = str(name).strip().upper()
    value = re.sub(r"[^A-Z0-9]+", " ", value)
    return value


def best_column_match(target, candidates):
    normalized_target = normalize_column_name(target)
    best = None
    best_score = -1
    for candidate in candidates:
        candidate_norm = normalize_column_name(candidate)
        score = fuzz.ratio(normalized_target, candidate_norm)
        if score > best_score:
            best_score = score
            best = candidate
        # boost synonyms
        if normalized_target in COLUMN_SYNONYMS and candidate_norm in [normalize_column_name(x) for x in COLUMN_SYNONYMS[normalized_target]]:
            best_score = max(best_score, 95)
            best = candidate
    return best if best_score >= 50 else None


def infer_table_type(df, filename):
    headers = " ".join([normalize_column_name(c) for c in df.columns])
    name = normalize_column_name(filename)
    scores = {table: 0 for table in TABLE_KEYWORDS}

    for table, keywords in TABLE_KEYWORDS.items():
        for token in keywords:
            token_norm = normalize_column_name(token)
            if token_norm in name or token_norm in headers:
                scores[table] += 1
    best_table = max(scores, key=scores.get)
    if scores[best_table] == 0:
        return None
    return best_table


def infer_date_column(df):
    date_candidates = [c for c in df.columns if any(x in normalize_column_name(c) for x in ["DATE", "JOUR", "MOIS", "ANNEE", "YEAR"])]
    if not date_candidates:
        return None
    return date_candidates[0]


def parse_dates(series):
    if series.dtype == object or pd.api.types.is_string_dtype(series):
        parsed = pd.to_datetime(series.astype(str).str.replace(r"[^0-9/\-\. ]", "", regex=True), errors="coerce", dayfirst=False)
    else:
        parsed = pd.to_datetime(series, errors="coerce")
    return parsed


def build_date_key(series):
    dates = parse_dates(series)
    dates = dates.fillna(pd.NaT)
    dates = dates.apply(lambda d: d if pd.isna(d) or d.year <= 9999 else pd.NaT)
    return dates.apply(lambda d: None if pd.isna(d) else int(d.strftime("%Y%m%d")))


def infer_date_from_filename(filename):
    text = filename.upper()
    year = None
    month = "01"
    match_year = re.search(r"(20\d{2})", text)
    if match_year:
        year = match_year.group(1)
    month_map = {
        "JAN": "01", "FEV": "02", "MAR": "03", "AVR": "04", "APR": "04", "MAY": "05", "MAI": "05", "JUN": "06", "JUIL": "07", "JUL": "07", "AOU": "08", "AUG": "08", "SEP": "09", "OCT": "10", "NOV": "11", "DEC": "12",
    }
    for token, value in month_map.items():
        if token in text:
            month = value
            break
    if year:
        return int(f"{year}{month}15")
    return None


def map_columns_for_table(table_name, df_columns):
    mapping = {}
    for target in TARGET_TABLES[table_name]:
        best = best_column_match(target, df_columns)
        mapping[target] = best
    return mapping


def normalize_employee_key(value):
    if pd.isna(value):
        return None
    return str(value).strip()


def ensure_date_key(df, date_col, target_col, source_name):
    if target_col in df.columns and df[target_col].notnull().any():
        return df
    if date_col not in df.columns:
        return df
    df[target_col] = build_date_key(df[date_col])
    if df[target_col].isnull().all():
        inferred = infer_date_from_filename(source_name)
        if inferred:
            df[target_col] = inferred
    return df


def compute_risk_probability(row):
    tenure = float(row.get("tenure_months", 0) or 0)
    salary = float(row.get("salary", 0) or 0)
    absence = float(row.get("total_absence_days_last_year", 0) or 0)
    # fallback logistic formula
    intercept = -1.2
    coef_tenure = -0.02
    coef_salary = 0.00015
    coef_absence = 0.03
    linear = intercept + coef_tenure * tenure + coef_salary * salary + coef_absence * absence
    probability = 1 / (1 + np.exp(-linear))
    return float(np.clip(probability, 0, 1))


def risk_level(probability):
    if probability >= 0.65:
        return "High"
    if probability >= 0.35:
        return "Medium"
    return "Low"


def build_dim_date(all_dates):
    unique_dates = sorted({d for d in all_dates if d is not None})
    rows = []
    for date_key in unique_dates:
        try:
            dt = datetime.strptime(str(date_key), "%Y%m%d")
        except Exception:
            continue
        rows.append({
            "date_key": date_key,
            "date": dt.strftime("%Y-%m-%d"),
            "year": dt.year,
            "month": dt.month,
            "day": dt.day,
            "quarter": (dt.month - 1) // 3 + 1,
            "weekday": dt.strftime("%A"),
        })
    return pd.DataFrame(rows)


def build_dimension(df, key_name, name_name):
    values = df[name_name].dropna().astype(str).str.strip().replace("", np.nan).dropna().unique()
    rows = [{key_name: str(v).upper().replace(" ", "_").replace("/", "_").replace("-", "_").strip(), name_name: v} for v in values]
    return pd.DataFrame(rows)


def create_sqlite_db(tables, db_path):
    if os.path.exists(db_path):
        os.remove(db_path)
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA foreign_keys = ON")

    def empty_table(table_name):
        cols = TARGET_TABLES.get(table_name, [])
        return pd.DataFrame({col: pd.Series(dtype="object") for col in cols})

    def normalize_sql_columns(df):
        clean_cols = []
        for idx, col in enumerate(df.columns):
            name = str(col)
            name = re.sub(r"[^0-9A-Za-z_]+", "_", name).strip("_")
            if not name:
                name = f"col_{idx}"
            clean_cols.append(name)
        df.columns = clean_cols
        return df

    for table_name, df in tables.items():
        if df is None or not isinstance(df, pd.DataFrame) or df.columns.empty:
            df = empty_table(table_name)
        if df.columns.empty:
            df = empty_table(table_name)
        df = normalize_sql_columns(df)
        df.to_sql(table_name, conn, if_exists="replace", index=False)
    conn.close()
    return db_path


def parse_month_from_filename(filename):
    """Extract month and year from file names like 'TPS MAI 2022.csv'"""
    match = re.search(r'(\w+)\s*(\d{4})', filename.upper())
    if not match:
        return None
    month_name, year = match.group(1), int(match.group(2))
    month_map = {
        'JANV': 1, 'JANVIER': 1, 'JAN': 1,
        'FEV': 2, 'FEVRIER': 2, 'FEB': 2,
        'MARS': 3, 'MAR': 3,
        'AVR': 4, 'AVRIL': 4, 'APR': 4,
        'MAI': 5, 'MAY': 5,
        'JUIN': 6, 'JUN': 6,
        'JUIL': 7, 'JUILLET': 7, 'JUL': 7,
        'AOUT': 8, 'AUG': 8,
        'SEPT': 9, 'SEP': 9,
        'OCT': 10,
        'NOV': 11,
        'DEC': 12,
    }
    month_num = month_map.get(month_name, 1)
    return pd.Timestamp(year=year, month=month_num, day=1)


def safe_float_convert(value):
    """Convert a scalar value to float, setting errors to 0."""
    numeric_value = pd.to_numeric(value, errors='coerce')
    return np.nan_to_num(numeric_value, nan=0.0)


def build_warehouse(data_frames, mappings):
    summary = {}
    employee_info = {}  # Accumulate employee attributes from all sources
    
    # Collect employee attributes from all data frames
    for table_name, df in data_frames.items():
        if df.empty:
            continue
        for col in ['matricule', 'employee_key', 'employeekey', 'emp_id']:
            if normalize_column_name(col) in [normalize_column_name(c) for c in df.columns]:
                actual_col = next(c for c in df.columns if normalize_column_name(c) == normalize_column_name(col))
                break
        else:
            actual_col = None
        
        if actual_col:
            for attr_col in df.columns:
                attr_name = normalize_column_name(attr_col)
                if any(x in attr_name for x in ['GENDER', 'SEXE', 'SERVICE', 'DEPARTMENT', 'DIRECTION', 'EMPLOI', 'POSITION']):
                    for _, row in df.iterrows():
                        if pd.notna(row.get(actual_col)):
                            mat = str(row[actual_col]).strip()
                            if mat not in employee_info:
                                employee_info[mat] = {}
                            if pd.notna(row[attr_col]):
                                employee_info[mat][attr_col] = str(row[attr_col]).strip()
    
    # Build employee dimension
    employee_df = pd.DataFrame()
    if "Dim_Employee" in data_frames:
        df = data_frames["Dim_Employee"].copy()
        emp_key_col = mappings["Dim_Employee"].get("employee_key")
        if emp_key_col:
            df["employee_key"] = df[emp_key_col].map(normalize_employee_key)
        else:
            df["employee_key"] = [f"EMP_{i + 1}" for i in range(len(df))]
        df["full_name"] = df.get(mappings["Dim_Employee"].get("full_name", ""))
        df["gender"] = df.get(mappings["Dim_Employee"].get("gender", ""))
        df["department"] = df.get(mappings["Dim_Employee"].get("department", ""))
        df["position"] = df.get(mappings["Dim_Employee"].get("position", ""))
        df["hire_date"] = df.get(mappings["Dim_Employee"].get("hire_date", ""))
        df["termination_date"] = df.get(mappings["Dim_Employee"].get("termination_date", ""))
        df["tenure_months"] = pd.to_numeric(df.get(mappings["Dim_Employee"].get("tenure_months", "")), errors="coerce")
        df["salary"] = pd.to_numeric(df.get(mappings["Dim_Employee"].get("salary", "")), errors="coerce")
        df["status"] = df.get(mappings["Dim_Employee"].get("status", ""))
        df["employee_key"] = df["employee_key"].fillna(method="ffill").fillna(method="bfill").astype(str)
        employee_df = df[["employee_key", "full_name", "gender", "department", "position", "hire_date", "termination_date", "tenure_months", "salary", "status"]].drop_duplicates(subset=["employee_key"])
        
        # Enrich with accumulated employee info
        for mat, attrs in employee_info.items():
            if mat not in employee_df['employee_key'].values:
                new_row = {'employee_key': mat}
                for attr in ['full_name', 'gender', 'department', 'position', 'hire_date', 'termination_date', 'tenure_months', 'salary', 'status']:
                    new_row[attr] = None
                employee_df = pd.concat([employee_df, pd.DataFrame([new_row])], ignore_index=True)
    else:
        # Build employee dimension from employee_info
        rows = [{'employee_key': mat, 'full_name': None, 'gender': attrs.get('sexe du salarié'), 'department': attrs.get('service'), 
                 'position': attrs.get('emploi type'), 'hire_date': None, 'termination_date': None, 'tenure_months': None, 'salary': None, 'status': None} 
                for mat, attrs in employee_info.items()]
        if rows:
            employee_df = pd.DataFrame(rows)
        else:
            employee_df = pd.DataFrame(columns=["employee_key", "full_name", "gender", "department", "position", "hire_date", "termination_date", "tenure_months", "salary", "status"])
    
    summary["Dim_Employee"] = len(employee_df)

    # Build date dimension
    all_date_keys = []
    for table_name, df in data_frames.items():
        for col in df.columns:
            if "DATE" in normalize_column_name(col) or "ANNEE" in normalize_column_name(col) or "YEAR" in normalize_column_name(col):
                all_date_keys.extend(build_date_key(df[col].astype(str)).dropna().astype(int).tolist())
            if col.endswith("_KEY") and "DATE" in normalize_column_name(col):
                all_date_keys.extend(df[col].dropna().astype(int).tolist())
    date_df = build_dim_date(all_date_keys)
    summary["Dim_Date"] = len(date_df)

    # Build department and position dimensions
    dept_df = build_dimension(employee_df, "department_key", "department") if not employee_df.empty else pd.DataFrame(columns=["department_key", "department"])
    pos_df = build_dimension(employee_df, "position_key", "position") if not employee_df.empty else pd.DataFrame(columns=["position_key", "position"])
    summary["Dim_Department"] = len(dept_df)
    summary["Dim_Position"] = len(pos_df)

    # Build fact tables with improved handling
    def build_fact(table_name, field_map, default_values=None):
        if table_name not in data_frames:
            return pd.DataFrame()
        df = data_frames[table_name].copy()
        result = pd.DataFrame()
        for target_col in TARGET_TABLES[table_name]:
            source_col = field_map.get(target_col)
            if source_col in df.columns:
                result[target_col] = df[source_col]
            elif target_col.endswith("_key") and "DATE" in target_col:
                date_col = infer_date_column(df)
                result = ensure_date_key(df, date_col, target_col, table_name)
                result[target_col] = df.get(target_col)
            else:
                result[target_col] = default_values.get(target_col) if default_values else None
        if "employee_key" not in result.columns or result["employee_key"].isnull().all():
            candidate = next((c for c in df.columns if any(token in normalize_column_name(c) for token in ["EMPLOYEE", "ID", "MATRICULE", "CODE"])), None)
            if candidate is not None:
                result["employee_key"] = df[candidate].map(normalize_employee_key)
        if "employee_key" in result.columns:
            result["employee_key"] = result["employee_key"].map(normalize_employee_key)
        return result

    # Build fact absence with proper type mapping
    fact_absence = pd.DataFrame()
    if "Fact_Absence" in data_frames:
        abs_df = data_frames["Fact_Absence"].copy()
        absence_cols = {
            'congés payés (h)': 'Paid Leave',
            'congés payés': 'Paid Leave',
            'maladie': 'Sick',
            'maternité': 'Maternity',
            'deces 3j': 'Bereavement (3 days)',
            'naissance2/deces2': 'Birth/Bereavement (2 days)',
            'absence autorisée rémunérée': 'Authorized Paid Absence',
            'congé sans solde': 'Unpaid Leave',
            'rcj/rca': 'RCJ/RCA',
            'accidents': 'Accident',
            'absence non justifie': 'Unexcused Absence'
        }
        
        absence_records = []
        mat_col = next((c for c in abs_df.columns if 'matricule' in normalize_column_name(c) or 'employee' in normalize_column_name(c) or 'id' in normalize_column_name(c)), None)
        
        for _, row in abs_df.iterrows():
            emp_key = row.get(mat_col) if mat_col else None
            if emp_key:
                emp_key = normalize_employee_key(emp_key)
            
            # Find date column
            date_col = next((c for c in abs_df.columns if 'date' in normalize_column_name(c)), None)
            date_key = None
            if date_col:
                date_key = build_date_key(pd.Series([row[date_col]]))[0]
            
            # Map absence types
            for col in abs_df.columns:
                col_norm = normalize_column_name(col)
                for absence_key, absence_type in absence_cols.items():
                    if absence_key.upper() in col_norm or col_norm in normalize_column_name(absence_key):
                        hours = safe_float_convert(row.get(col, 0))
                        if hours > 0:
                            days = hours / 8.0
                            absence_records.append({
                                'employee_key': emp_key,
                                'date_key': date_key,
                                'absence_type': absence_type,
                                'absence_days': days
                            })
                        break
        
        fact_absence = pd.DataFrame(absence_records) if absence_records else pd.DataFrame(columns=['employee_key', 'date_key', 'absence_type', 'absence_days'])
    
    if fact_absence.empty:
        fact_absence = build_fact("Fact_Absence", mappings.get("Fact_Absence", {}), {"absence_type": "Unknown", "absence_days": 0})
    
    fact_turnover = build_fact("Fact_Turnover", mappings.get("Fact_Turnover", {}), {"turnover_type": "Unknown", "reason": "Unknown"})
    fact_recruitment = build_fact("Fact_Recruitment", mappings.get("Fact_Recruitment", {}), {"time_to_hire_days": 0, "probation_months": 0, "cost": 0})
    fact_snapshot = build_fact("Fact_Employee_Snapshot", mappings.get("Fact_Employee_Snapshot", {}), {"worked_hours": 0, "headcount_flag": 1})
    features_df = build_fact("features_for_attrition", mappings.get("features_for_attrition", {}), {"tenure_months": 0, "salary": 0, "total_absence_days_last_year": 0, "turnover_flag": 0})

    # Ensure date keys for facts and features
    for df in [fact_turnover, fact_absence, fact_recruitment, fact_snapshot, features_df]:
        if "date_key" in df.columns:
            df["date_key"] = pd.to_numeric(df["date_key"], errors="coerce").astype(pd.Int64Dtype())

    # Fill missing employee profiles from facts if needed
    employee_keys = set(employee_df["employee_key"].astype(str).tolist()) if not employee_df.empty else set()
    all_fact_employee_keys = set()
    for df in [fact_turnover, fact_absence, fact_recruitment, fact_snapshot, features_df]:
        if "employee_key" in df.columns:
            all_fact_employee_keys.update(df["employee_key"].dropna().astype(str).unique())
    missing_keys = all_fact_employee_keys - employee_keys
    if missing_keys:
        missing_rows = pd.DataFrame([{"employee_key": k, "full_name": None, "gender": None, "department": None, "position": None, "hire_date": None, "termination_date": None, "tenure_months": None, "salary": None, "status": None} for k in missing_keys])
        employee_df = pd.concat([employee_df, missing_rows], ignore_index=True)
        summary["Dim_Employee"] = len(employee_df)

    summary["Fact_Turnover"] = len(fact_turnover)
    summary["Fact_Absence"] = len(fact_absence)
    summary["Fact_Recruitment"] = len(fact_recruitment)
    summary["Fact_Employee_Snapshot"] = len(fact_snapshot)
    summary["features_for_attrition"] = len(features_df)

    # Build RiskScores from features with improved calculations
    risk_rows = []
    if not features_df.empty:
        features_df["tenure_months"] = pd.to_numeric(features_df.get("tenure_months", 0), errors="coerce").fillna(0)
        features_df["salary"] = pd.to_numeric(features_df.get("salary", 0), errors="coerce").fillna(0)
        features_df["total_absence_days_last_year"] = pd.to_numeric(features_df.get("total_absence_days_last_year", 0), errors="coerce").fillna(0)
        
        # Calculate total absence days from fact_absence if not present
        if (features_df["total_absence_days_last_year"] == 0).all() and not fact_absence.empty:
            abs_summary = fact_absence.groupby("employee_key")["absence_days"].sum().reset_index()
            abs_summary.columns = ["employee_key", "total_absence_days_last_year"]
            features_df = features_df.merge(abs_summary, on="employee_key", how="left")
            features_df["total_absence_days_last_year"] = features_df["total_absence_days_last_year_y"].fillna(features_df["total_absence_days_last_year_x"]).fillna(0)
            features_df = features_df.drop(columns=[c for c in features_df.columns if '_x' in c or '_y' in c], errors='ignore')
        
        features_df["turnover_flag"] = features_df.get("turnover_flag", 0).fillna(0).astype(int)
        features_df["risk_probability"] = features_df.apply(compute_risk_probability, axis=1)
        features_df["risk_level"] = features_df["risk_probability"].apply(risk_level)
        features_df["model_name"] = "HeuristicLogistic_v1"
        risk_rows = features_df[["employee_key", "date_key", "risk_probability", "risk_level", "model_name"]].copy()
    risk_df = risk_rows if len(risk_rows) else pd.DataFrame(columns=TARGET_TABLES["RiskScores"])
    summary["RiskScores"] = len(risk_df)

    warehouse_tables = {
        "Dim_Date": date_df,
        "Dim_Employee": employee_df,
        "Dim_Department": dept_df,
        "Dim_Position": pos_df,
        "Fact_Turnover": fact_turnover,
        "Fact_Absence": fact_absence,
        "Fact_Recruitment": fact_recruitment,
        "Fact_Employee_Snapshot": fact_snapshot,
        "features_for_attrition": features_df,
        "RiskScores": risk_df,
    }
    return warehouse_tables, summary


def render_summary(summary):
    st.write("## Warehouse Build Summary")
    for table_name, count in summary.items():
        st.metric(table_name, count)


def render_overview(tables):
    st.header("Overview")
    if tables["Dim_Employee"].empty:
        st.warning("No employee master data available. Upload an employee file or ensure employee IDs are present in the uploaded records.")
        return
    emp = tables["Dim_Employee"]
    turnover = tables["Fact_Turnover"]
    absence = tables["Fact_Absence"]
    risk = tables["RiskScores"]

    cols = st.columns(4)
    cols[0].metric("Active Employees", len(emp))
    cols[1].metric("Turnover Events", len(turnover))
    
    # Calculate total absence days correctly
    total_absence = 0
    if not absence.empty and "absence_days" in absence.columns:
        total_absence = int(absence["absence_days"].sum())
    cols[2].metric("Total Absence Days", total_absence)
    
    # Calculate average risk correctly
    avg_risk = 0
    if not risk.empty and "risk_probability" in risk.columns:
        avg_risk = round(risk["risk_probability"].mean(), 3)
    cols[3].metric("Average Risk", avg_risk)

    if not turnover.empty:
        turnover["date_key"] = turnover["date_key"].astype(pd.Int64Dtype())
        turnover_by_year = turnover.groupby(turnover["date_key"].astype(str).str.slice(0, 4))["employee_key"].count().reset_index(name="count")
        fig = px.bar(turnover_by_year, x="date_key", y="count", title="Turnover Events by Year")
        st.plotly_chart(fig, use_container_width=True)

    if not absence.empty and "absence_type" in absence.columns:
        absence_by_type = absence.groupby("absence_type")["absence_days"].sum().reset_index().sort_values("absence_days", ascending=False)
        fig = px.bar(absence_by_type, x="absence_type", y="absence_days", title="Absence Days by Type")
        st.plotly_chart(fig, use_container_width=True)


def render_turnover(tables):
    st.header("Turnover")
    df = tables["Fact_Turnover"]
    if df.empty:
        st.info("No turnover records were detected.")
        return
    if "date_key" in df.columns:
        df["date"] = pd.to_datetime(df["date_key"].astype(str), format="%Y%m%d", errors="coerce")
    st.dataframe(df.head(20))
    if not df.empty:
        count_by_reason = df.groupby("reason")["employee_key"].count().reset_index(name="count")
        fig = px.bar(count_by_reason, x="reason", y="count", title="Turnover by Reason")
        st.plotly_chart(fig, use_container_width=True)


def render_absence(tables):
    st.header("Absence")
    df = tables["Fact_Absence"]
    if df.empty:
        st.info("No absence records were detected.")
        return
    st.dataframe(df.head(20))
    if not df.empty and "absence_type" in df.columns:
        absence_by_type_total = df.groupby("absence_type")["absence_days"].sum().reset_index().sort_values("absence_days", ascending=False)
        fig = px.bar(absence_by_type_total, x="absence_type", y="absence_days", title="Total Absence Days by Type")
        st.plotly_chart(fig, use_container_width=True)
        
        # Monthly trend if date_key exists
        if "date_key" in df.columns:
            df_copy = df.copy()
            df_copy["month"] = df_copy["date_key"].astype(str).str.slice(0, 6)
            absence_by_month = df_copy.groupby(["month", "absence_type"])["absence_days"].sum().reset_index()
            fig2 = px.bar(absence_by_month, x="month", y="absence_days", color="absence_type", title="Absence Days by Month and Type")
            st.plotly_chart(fig2, use_container_width=True)


def render_recruitment(tables):
    st.header("Recruitment")
    df = tables["Fact_Recruitment"]
    if df.empty:
        st.info("No recruitment records were detected.")
        return
    st.dataframe(df.head(20))
    if "hire_date_key" in df.columns:
        df["year"] = df["hire_date_key"].astype(str).str.slice(0, 4)
    fig = px.bar(df, x="year" if "year" in df.columns else "employee_key", y="cost", title="Recruitment Cost by Year")
    st.plotly_chart(fig, use_container_width=True)


def render_productivity(tables):
    st.header("Productivity")
    df = tables["Fact_Employee_Snapshot"]
    if df.empty:
        st.info("No snapshot data was detected.")
        return
    st.dataframe(df.head(20))
    if "worked_hours" in df.columns:
        fig = px.histogram(df, x="worked_hours", nbins=20, title="Worked Hours Distribution")
        st.plotly_chart(fig, use_container_width=True)


def render_training(tables):
    st.header("Training")
    st.info("No training data detected from the uploaded files. Add a training file or use a data source with formation/training records.")


def render_diversity(tables):
    st.header("Diversity")
    emp = tables["Dim_Employee"]
    if emp.empty:
        st.info("No employee master data available.")
        return
    if "gender" in emp.columns:
        gender_counts = emp["gender"].fillna("Unknown").value_counts().reset_index()
        gender_counts.columns = ["gender", "count"]
        fig = px.pie(gender_counts, names="gender", values="count", title="Gender Distribution")
        st.plotly_chart(fig, use_container_width=True)
    if "department" in emp.columns:
        dept_counts = emp["department"].fillna("Unknown").value_counts().reset_index()
        dept_counts.columns = ["department", "count"]
        fig = px.bar(dept_counts.head(20), x="department", y="count", title="Employees by Department")
        st.plotly_chart(fig, use_container_width=True)


def render_people_care(tables):
    st.header("People Care")
    absence = tables["Fact_Absence"]
    if absence.empty:
        st.info("No absence records were detected.")
        return
    if "absence_type" in absence.columns:
        absence_counts = absence.groupby("absence_type")["absence_days"].sum().reset_index().sort_values("absence_days", ascending=False)
        fig = px.bar(absence_counts, x="absence_type", y="absence_days", title="Absence Days by Type")
        st.plotly_chart(fig, use_container_width=True)
    st.markdown("_This page uses employee wellbeing signals derived from absence patterns. If you have people care survey data, add it to the input files._")


def render_prediction(tables):
    st.header("Prediction")
    risk_df = tables["RiskScores"]
    if risk_df.empty:
        st.info("No risk score data available.")
        return
    threshold = st.slider("Risk threshold", 0.0, 1.0, 0.35, step=0.05)
    selected = risk_df[risk_df["risk_probability"] >= threshold]
    st.markdown(f"**Employees above threshold:** {len(selected)}")
    fig = px.histogram(risk_df, x="risk_probability", nbins=20, title="Risk Probability Distribution")
    st.plotly_chart(fig, use_container_width=True)
    if not selected.empty:
        st.dataframe(selected.head(20))


def app():
    st.title("HR Upload & Auto Dashboard Generator")
    st.markdown(
        "Upload your HR CSV/XLSX files and the app will infer columns, build a warehouse, and display a user dashboard."
    )

    uploaded_files = st.file_uploader("Upload HR data files (CSV/Excel)", accept_multiple_files=True, type=["csv", "xlsx", "xls"])
    if not uploaded_files:
        st.info("Start by uploading at least one HR data file.")
        return

    data_frames = {}
    detected_tables = {}
    mapping_suggestions = {}

    for uploaded in uploaded_files:
        df = read_data_file(uploaded)
        if df.empty:
            st.warning(f"Could not read file: {uploaded.name}")
            continue
        table_type = infer_table_type(df, uploaded.name) or "Dim_Employee"
        if table_type in data_frames:
            data_frames[table_type] = pd.concat([data_frames[table_type], df], ignore_index=True)
        else:
            data_frames[table_type] = df
        detected_tables[uploaded.name] = table_type
        if table_type not in mapping_suggestions:
            mapping_suggestions[table_type] = map_columns_for_table(table_type, df.columns)

    st.subheader("Detected file mapping")
    for filename, table in detected_tables.items():
        st.markdown(f"**{filename}** → `{table}`")

    st.markdown("---")
    st.subheader("Review and correct inferred column mappings")

    mapping_overrides = {}
    for table_name, df in data_frames.items():
        with st.expander(f"{table_name} mapping", expanded=True):
            suggested = mapping_suggestions.get(table_name, {})
            cols = ["<none>"] + list(df.columns)
            mapping_overrides[table_name] = {}
            for target_col in TARGET_TABLES[table_name]:
                default = suggested.get(target_col) if suggested.get(target_col) in df.columns else "<none>"
                choice = st.selectbox(f"{table_name} → {target_col}", cols, index=cols.index(default) if default in cols else 0, key=f"{table_name}_{target_col}")
                mapping_overrides[table_name][target_col] = choice if choice != "<none>" else None

    if st.button("Build warehouse and generate dashboard"):
        with st.spinner("Building the data warehouse..."):
            warehouse_tables, summary = build_warehouse(data_frames, mapping_overrides)
            db_temp = os.path.join(tempfile.gettempdir(), "user_uploaded_dw.db")
            create_sqlite_db(warehouse_tables, db_temp)
            st.success("Data warehouse built successfully.")
            render_summary(summary)
            st.markdown("---")
            st.download_button("Download SQLite Warehouse", data=open(db_temp, "rb"), file_name="user_uploaded_dw.db", mime="application/x-sqlite3")
            csv_zip_path = os.path.join(tempfile.gettempdir(), "user_uploaded_dw_csv.zip")
            with tempfile.TemporaryDirectory() as tmpdir:
                for table_name, df in warehouse_tables.items():
                    path = os.path.join(tmpdir, f"{table_name}.csv")
                    df.to_csv(path, index=False)
                import zipfile

                with zipfile.ZipFile(csv_zip_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
                    for filename in os.listdir(tmpdir):
                        zf.write(os.path.join(tmpdir, filename), arcname=filename)
            st.download_button("Download CSV Warehouse Bundle", data=open(csv_zip_path, "rb"), file_name="user_uploaded_dw_csv.zip", mime="application/zip")

            tab1, tab2 = st.tabs(["Dashboard", "Tables"])
            with tab1:
                page = st.sidebar.radio("Dashboard page", PAGES)
                if page == "Overview":
                    render_overview(warehouse_tables)
                elif page == "Turnover":
                    render_turnover(warehouse_tables)
                elif page == "Absence":
                    render_absence(warehouse_tables)
                elif page == "Recruitment":
                    render_recruitment(warehouse_tables)
                elif page == "Productivity":
                    render_productivity(warehouse_tables)
                elif page == "Training":
                    render_training(warehouse_tables)
                elif page == "Diversity":
                    render_diversity(warehouse_tables)
                elif page == "People Care":
                    render_people_care(warehouse_tables)
                elif page == "Prediction":
                    render_prediction(warehouse_tables)
            with tab2:
                for table_name, df in warehouse_tables.items():
                    with st.expander(table_name, expanded=False):
                        st.dataframe(df.head(50))


if __name__ == "__main__":
    app()
