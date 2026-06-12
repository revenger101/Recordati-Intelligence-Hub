import React, { createContext, useState, useCallback, useEffect } from 'react';

export const DataContext = createContext({ 
  employees: [], 
  totalEmployees: 0, 
  activeEmployees: 0, 
  monthlyStats: [], 
  recommendations: [],
  isLoading: true, 
  refresh: () => {}, 
  targetDept: 'All', 
  setTargetDept: () => {} 
});

export const DataProvider = ({ children }) => {
  const [employees, setEmployees] = useState([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [activeEmployees, setActiveEmployees] = useState(0);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [targetDept, setTargetDept] = useState('All');

  const generateFakes = () => {
      const d = [];
      const depts = ['FOE', 'DAF', 'GRH', 'ITM', 'MKTG', 'LOGISTIQUE'];
      for(let i=0; i<153; i++) {
         d.push({
            id: `MAT-${1000+i}`, name: `Employé ${i}`, dept: depts[i%depts.length],
            role: 'Opérateur', salary: 1500 + Math.random()*2000, age: 25 + Math.random()*30,
            risk_score: Math.random(), status: i>145 ? 'Congé' : 'Actif', genre: i%2===0 ? 'M' : 'F',
            absences: Math.random() * 5
         });
      }
      return d;
  };

  const loadData = useCallback(async (manualData = null, dept = null) => {
    setIsLoading(true);
    let targetDept = dept;
    if (typeof manualData === 'string') {
        targetDept = manualData;
        manualData = null;
    }

    if (manualData && Array.isArray(manualData)) {
       setEmployees(manualData);
       setIsLoading(false);
       return;
    }

    try {
      const token = localStorage.getItem('token') || 'bypass';
      const statsUrl = targetDept && targetDept !== 'All' ? `/api/analytics/monthly?dept=${encodeURIComponent(targetDept)}` : '/api/analytics/monthly';
      
      const [empRes, statRes, recRes] = await Promise.all([
        fetch('/api/employees', { headers: { 'Authorization': `Bearer ${token}` }}).catch(() => ({ ok: false })),
        fetch(statsUrl, { headers: { 'Authorization': `Bearer ${token}` }}).catch(() => ({ ok: false })),
        fetch('/api/analytics/strategic-recommendations', { headers: { 'Authorization': `Bearer ${token}` }}).catch(() => ({ ok: false }))
      ]);

      let empData = [];
      if(empRes.ok) {
        empData = await empRes.json();
      } else {
        // FALLBACK TO CSV SNAPSHOT
        console.warn("API Down. Attempting CSV Snapshot fallback...");
        const csvRes = await fetch('/data_snapshot.csv').catch(() => null);
        if (csvRes && csvRes.ok) {
           const text = await csvRes.text();
           const lines = text.split('\n').filter(l => l.trim());
           const headers = lines[0].split(',').map(h => h.trim());
           empData = lines.slice(1).map(line => {
              const values = line.split(',');
              const obj = {};
              headers.forEach((h, i) => {
                 let val = values[i];
                 if (!isNaN(val) && val !== '') val = Number(val);
                 obj[h] = val;
              });
              return obj;
           });
        }
      }

      if(empData.length > 0) {
        let mapped = empData.map(e => ({
          ...e, 
          id: e.employee_id || e.id, 
          name: e.name || `${e.prenom || ''} ${e.nom || ''}`.trim() || 'Imported User', 
          dept: e.dept || e.departement || 'NC', 
          role: e.role || e.poste || 'Employee', 
          salary: Number(e.salary || e.salaire || 0), 
          risk_score: Number(e.risk_score || 0),
          age: Number(e.age || 35),
          statut: e.statut || 'Actif',
          anciennete: Number(e.AncMois || e.anciennete_annees || 0) / 12,
          absences: Number(e.total_abs || e.absences || 0)
        }));
        
        setEmployees(mapped);
        setTotalEmployees(mapped.length);
        setActiveEmployees(mapped.filter(e => e.statut && e.statut.toUpperCase() !== 'SORTANT').length);
      } else {
        // CLEAN MODE FOR INGESTION TEST: No Fakes
        setEmployees([]);
        setTotalEmployees(0);
        setActiveEmployees(0);
      }

      if(statRes.ok) {
        const s = await statRes.json();
        setMonthlyStats(s);
      }

      if(recRes && recRes.ok) {
        const r = await recRes.json();
        setRecommendations(r);
      }
    } catch (e) {
      console.error("Load Error:", e);
      setEmployees([]);
    }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <DataContext.Provider value={{ 
      employees, 
      totalEmployees, 
      activeEmployees, 
      monthlyStats, 
      recommendations, 
      isLoading, 
      refresh: loadData, 
      refreshData: loadData,
      targetDept, 
      setTargetDept 
    }}>
      {children}
    </DataContext.Provider>
  );
};
