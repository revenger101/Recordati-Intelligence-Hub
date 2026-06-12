import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

# Load configuration
load_dotenv(os.path.join(os.path.dirname(__file__), '../.env'))

DB_CONFIG = {
    'dbname': os.environ.get('POSTGRES_DB', 'rh_db'),
    'user': os.environ.get('POSTGRES_USER', 'rh_user'),
    'password': os.environ.get('POSTGRES_PASSWORD', 'rh_secret_change_me'),
    'host': os.environ.get('POSTGRES_HOST', '127.0.0.1'),
    'port': os.environ.get('POSTGRES_PORT', '5433')
}

def generate_recommendations():
    print("=== NEXUS STRATEGIC INSIGHTS v7.0 ===")
    
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # 1. Fetch High Risk Profiles with correct Star Schema Joins
        query = """
            SELECT 
                d.dept_name as departement, 
                f.risk_factors as facteurs_risque, 
                f.risk_score as probabilite_turnover
            FROM fact_employee f
            JOIN dim_employee e ON f.employee_fk = e.employee_sk
            JOIN dim_department d ON f.dept_fk = d.dept_sk
            WHERE f.risk_score > 0.15 AND f.is_active = TRUE
        """
        cur.execute(query)
        rows = cur.fetchall()
        
        if not rows:
            print("No high-risk profiles found to analyze. Recommendations generation skipped.")
            return

        # 2. Heuristic Analysis by Department
        analysis = {}
        for row in rows:
            dept = row['departement']
            if dept not in analysis:
                analysis[dept] = {'count': 0, 'factors': [], 'avg_risk': 0}
            
            analysis[dept]['count'] += 1
            analysis[dept]['avg_risk'] += float(row['probabilite_turnover'])
            if row['facteurs_risque']:
                analysis[dept]['factors'].extend([f.strip() for f in row['facteurs_risque'].split('|')])

        # 3. Decision Logic for Recommendations
        recommendations = []
        for dept, data in analysis.items():
            avg_risk = data['avg_risk'] / data['count']
            count = data['count']
            
            # Get top 2 recurring factors
            factor_counts = {}
            for f in data['factors']: factor_counts[f] = factor_counts.get(f, 0) + 1
            common_factors = sorted(factor_counts, key=factor_counts.get, reverse=True)[:2]
            factors_str = " / ".join(common_factors)
            
            # Mapping Logic
            if any(x in factors_str for x in ["Overtime", "Burnout", "Surcharge"]):
                 recommendations.append({
                     'svc': dept[:3].upper() if dept else 'GEN',
                     'pri': 'High' if avg_risk > 0.4 else 'Medium',
                     'rec': f"Workload Audit required in {dept}. Burnout risk detected for {count} profiles.",
                     'ctx': f"Overtime Alert: {factors_str}",
                     'imp': "Mitigate burnout and early attrition"
                 })
            
            if "Seniority" in factors_str:
                 recommendations.append({
                     'svc': dept[:3].upper() if dept else 'GEN',
                     'pri': 'Medium',
                     'rec': f"Onboarding 'Phase 2' (Retention Program) for {dept}.",
                     'ctx': f"Seniority Threshold Risk: {factors_str}",
                     'imp': "Improve retention for new hires"
                 })

            if "Absenteeism" in factors_str:
                 recommendations.append({
                     'svc': dept[:3].upper() if dept else 'GEN',
                     'pri': 'High',
                     'rec': f"Quality of Life at Work (QVT) Audit for {dept}.",
                     'ctx': f"Absenteeism Signals: {factors_str}",
                     'imp': "Identify underlying workplace climate issues"
                 })

            if "Salary" in factors_str:
                 recommendations.append({
                     'svc': dept[:3].upper() if dept else 'GEN',
                     'pri': 'Low',
                     'rec': f"Sectoral Salary Benchmarking for {dept}.",
                     'ctx': f"Compensation Risk: {factors_str}",
                     'imp': "Reduce risk of departure for external offers"
                 })

        # 4. Save to Database
        # Clear old recommendations
        cur.execute("UPDATE strategic_recommendations SET active = FALSE WHERE active = TRUE")
        
        insert_query = """
            INSERT INTO strategic_recommendations (service_code, priorite, recommandation, contexte_risque, impact_estime, active)
            VALUES (%s, %s, %s, %s, %s, TRUE)
        """
        for r in recommendations:
            cur.execute(insert_query, (r['svc'], r['pri'], r['rec'], r['ctx'], r['imp']))
        
        conn.commit()
        print(f"COMPLETE: {len(recommendations)} strategic recommendations synchronized with Nexus Engine.")

    except Exception as e:
        print(f"ERROR: Insight Generation failed: {e}")
    finally:
        if 'cur' in locals(): cur.close()
        if 'conn' in locals(): conn.close()

if __name__ == "__main__":
    generate_recommendations()
