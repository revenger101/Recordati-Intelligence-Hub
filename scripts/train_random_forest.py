import os
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from imblearn.over_sampling import SMOTE
import joblib
import json

# Paths
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DW_DIR = os.path.join(BASE_DIR, 'DataWarehouse')
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'turnover_rf_model.pkl')
SCALER_PATH = os.path.join(os.path.dirname(__file__), 'turnover_scaler.pkl')

def run_csv_based_rf_training():
    print("=== NEXUS AI v8.2 - OFFLINE PREDICTIVE ENGINE ===")
    
    try:
        # 1. Load Data from DataWarehouse CSVs
        print("STATUS: Loading DataWarehouse snapshots...")
        dim_employee = pd.read_csv(os.path.join(DW_DIR, 'Dim_Employee.csv'))
        fact_employee = pd.read_csv(os.path.join(DW_DIR, 'fact_employee.csv'))
        fact_absence = pd.read_csv(os.path.join(DW_DIR, 'Fact_Absence.csv'))
        
        # Try to load turnover data if it exists
        turnover_path = os.path.join(DW_DIR, 'Fact_Turnover.csv')
        if os.path.exists(turnover_path):
            fact_turnover = pd.read_csv(turnover_path)
            # Clean: ensure employee_fk is numeric and drop invalid rows
            fact_turnover['employee_fk'] = pd.to_numeric(fact_turnover['employee_fk'], errors='coerce')
            fact_turnover = fact_turnover.dropna(subset=['employee_fk'])
        else:
            fact_turnover = pd.DataFrame(columns=['employee_fk'])

        # 2. Feature Engineering
        print("STATUS: Engineering features...")
        
        # Merge Dim and Fact
        df = dim_employee.merge(fact_employee, left_on='employee_sk', right_on='employee_fk', how='left')
        
        # Calculate Absences per employee
        abs_summary = fact_absence.groupby('employee_fk')['duration_days'].sum().reset_index()
        abs_summary.columns = ['employee_sk', 'absences']
        df = df.merge(abs_summary, on='employee_sk', how='left').fillna({'absences': 0})
        
        # Seniority (Simulated if hire_date not present, or use existing)
        # For this version, we'll use a mix of simulated and derived
        df['seniority'] = np.random.uniform(0.5, 15, size=len(df)) # Simulated for now
        
        # Target variable: 1 if in turnover, 0 otherwise
        df['leave'] = df['employee_sk'].isin(fact_turnover['employee_fk']).astype(int)

        features = ['age', 'salary', 'seniority', 'absences']
        for col in features:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(df[col].median() if not df[col].empty else 0)
        
        X = df[features].copy()
        X.fillna(0, inplace=True)
        y = df['leave'].fillna(0)

        if len(df) < 10:
            print("ERROR: Insufficient data for training.")
            return

        # 3. Training
        print("STATUS: Training Random Forest (with Hyperparameter Tuning)...")
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        # Handle class imbalance if possible
        if len(np.unique(y)) > 1:
            smote = SMOTE(random_state=42)
            X_res, y_res = smote.fit_resample(X_scaled, y)
            
            # Grid Search for best hyperparameters
            from sklearn.model_selection import GridSearchCV
            param_grid = {
                'n_estimators': [50, 100, 200],
                'max_depth': [None, 10, 20],
                'min_samples_split': [2, 5]
            }
            rf_base = RandomForestClassifier(class_weight='balanced', random_state=42)
            grid_search = GridSearchCV(estimator=rf_base, param_grid=param_grid, cv=3, scoring='roc_auc', n_jobs=-1)
            grid_search.fit(X_res, y_res)
            
            rf_model = grid_search.best_estimator_
            print(f"STATUS: Best parameters found: {grid_search.best_params_}")
            
            # Save Model and Scaler for API consumption later
            joblib.dump(rf_model, MODEL_PATH)
            joblib.dump(scaler, SCALER_PATH)
            
            # 4. Inference
            print("STATUS: Scoring active workforce...")
            probs = rf_model.predict_proba(X_scaled)[:, 1]
            df['risk_score'] = probs
        else:
            print("WARNING: Only one class found in target. Using heuristic scores.")
            # Heuristic: base risk on absences and seniority
            df['risk_score'] = (df['absences'] / 30) + (1 / (df['seniority'] + 1))
            df['risk_score'] = df['risk_score'].clip(0, 0.9)
            rf_model = None

        # Driver Analysis
        def get_drivers(row):
            factors = []
            if row['salary'] < 2000: factors.append("Salary Competitive Risk")
            if row['absences'] > 10: factors.append("Absenteeism Signal")
            if row['seniority'] < 2: factors.append("New Joiner Fragility")
            return " | ".join(factors) if factors else "Healthy Profile"

        df['risk_factors'] = df.apply(get_drivers, axis=1)

        # 5. Save Results back to Fact_Employee
        print("STATUS: Syncing results to DataWarehouse...")
        
        # Update fact_employee with risk scores
        updated_fact = fact_employee.copy()
        risk_map = df.set_index('employee_sk')[['risk_score', 'risk_factors']].to_dict('index')
        
        updated_fact['risk_score'] = updated_fact['employee_fk'].map(lambda x: risk_map.get(x, {}).get('risk_score', 0))
        updated_fact['risk_factors'] = updated_fact['employee_fk'].map(lambda x: risk_map.get(x, {}).get('risk_factors', 'Healthy Profile'))
        
        updated_fact.to_csv(os.path.join(DW_DIR, 'fact_employee.csv'), index=False)
        
        # Create Predictions Log
        predictions_log = df[['employee_sk', 'risk_score', 'risk_factors']].copy()
        predictions_log['prediction_date'] = pd.Timestamp.now().strftime('%Y-%m-%d')
        predictions_log.to_csv(os.path.join(DW_DIR, 'predictions_log.csv'), index=False)

        print(f"SUCCESS: Scored {len(df)} employees with Nexus AI.")

    except Exception as e:
        print(f"CRITICAL ERROR in AI Pipeline: {e}")

if __name__ == "__main__":
    run_csv_based_rf_training()
