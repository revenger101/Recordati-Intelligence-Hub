import pandas as pd
import os

def run_audit():
    file_2026 = 'ETAT PERSO 2026.csv'
    if not os.path.exists(file_2026):
        print(f"ERREUR: {file_2026} introuvable.")
        return

    print(f"=== AUDIT QUALITE DES DONNEES : {file_2026} ===")
    
    # Try different encodings
    df = None
    for enc in ['utf-8-sig', 'latin-1', 'cp1252']:
        try:
            df = pd.read_csv(file_2026, encoding=enc, sep=None, engine='python')
            break
        except: continue
        
    if df is None:
        print("Impossible de lire le fichier.")
        return

    total = len(df)
    print(f"Effectif detecte : {total} lignes")
    print("-" * 40)

    # Check for core strategic columns
    checks = {
        'Matricule': ['MAT', 'MATRICULE', 'employee_id'],
        'Diplome': ['DIPLÔME', 'NIVEAU', 'EDUCATION', 'DEGREE'],
        'Fonction': ['FONCTION', 'ROLE', 'JOB'],
        'Direction': ['DIRECTION', 'DEPT', 'SERVICE']
    }

    results = []
    for canonical, synonyms in checks.items():
        col = next((c for c in df.columns if any(s in str(c).upper() for s in synonyms)), None)
        if col:
            missing = df[col].isna().sum() + (df[col].astype(str).str.strip() == '').sum()
            fill_rate = ((total - missing) / total) * 100
            print(f"COLONNE RECONNUE [{canonical}] : {col}")
            print(f"   -> Taux de remplissage : {fill_rate:.1f}%")
            print(f"   -> Valeurs manquantes : {missing}")
        else:
            print(f"ALERTE : Colonne pour [{canonical}] NON TROUVEE.")
    
    print("-" * 40)
    print("NB: Si le taux de remplissage d'une colonne est faible, les indicateurs du Tab 10 seront impactes.")

run_audit()
