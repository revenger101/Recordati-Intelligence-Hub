import React, { useMemo } from 'react';
import { 
  UserMinus, TrendingUp, Users, ShieldCheck, Target, 
  ArrowUpRight, BarChart3, MoveRight, BrainCircuit, Activity,
  AlertTriangle, Zap, Building2, Search
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, BarChart, Bar, 
  RadialBarChart, RadialBar, PieChart, Pie, ComposedChart, Scatter
} from 'recharts';

const COLORS = ['#ef4444', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#6366f1'];

const MetricCard = ({ label, value, trend, icon: Icon, color = 'var(--accent)', suffix = '', subtext }) => (
  <div className="glass-panel mini-card premium-hover fade-up">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.2rem' }}>
       <div style={{ padding: '0.7rem', borderRadius: '12px', background: `${color}11`, border: `1px solid ${color}33`, color }}>
          <Icon size={20} />
       </div>
       {trend !== undefined && (
         <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', fontWeight: 800, color: trend <= 0 ? 'var(--success)' : 'var(--danger)', padding: '4px 8px', borderRadius: '20px', background: 'rgba(255,255,255,0.03)' }}>
           {trend <= 0 ? <ShieldCheck size={10}/> : <TrendingUp size={10}/>} {Math.abs(trend)}%
         </div>
       )}
    </div>
    <div>
       <p className="metric-label">{label}</p>
       <h2 className="metric-value">
          {value}<span style={{ fontSize: '0.8rem', opacity: 0.5 }}>{suffix}</span>
       </h2>
       {subtext && <p style={{ fontSize: '0.65rem', opacity: 0.4, marginTop: '0.4rem', fontWeight: 700 }}>{subtext}</p>}
    </div>
  </div>
);

const Page3_Turnover = ({ employees = [], selectedMonth = {}, allHistory = [] }) => {
  const safeEmps = Array.isArray(employees) ? employees : [];
  
  // 1. DATA CALCULATIONS
  const departed = useMemo(() => safeEmps.filter(e => String(e.statut || '').toUpperCase() === 'SORTANT'), [safeEmps]);
  const active = useMemo(() => safeEmps.filter(e => String(e.statut || '').toUpperCase() !== 'SORTANT'), [safeEmps]);
  
  const stats = useMemo(() => {
    const totalEffectif = Number(selectedMonth.headcount) || active.length || 1;
    const totalDeparted = departed.length;
    const turnoverRate = (totalDeparted / totalEffectif) * 100;
    const stabilityScore = 100 - turnoverRate;
    
    // Risk Analysis
    const criticalRisks = active.filter(e => (Number(e.risk_score) || 0) >= 0.7);
    
    return {
      turnoverRate: turnoverRate.toFixed(1),
      stabilityScore: stabilityScore.toFixed(1),
      totalDeparted,
      totalEffectif,
      criticalRisks: criticalRisks.length
    };
  }, [selectedMonth, departed, active]);

  // 2. CHART DATA
  const deptData = useMemo(() => {
    const counts = {};
    departed.forEach(e => {
        const d = e.dept || 'N/C';
        counts[d] = (counts[d] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
  }, [departed]);

  const riskScatter = useMemo(() => {
     return active
       .slice(0, 30)
       .map(e => ({
          name: e.name || 'Anonyme',
          age: Number(e.age) || 30,
          absences: Number(e.absences) || 0,
          risk: (Number(e.risk_score) || 0) * 100
       }))
       .sort((a, b) => a.age - b.age);
  }, [active]);

  return (
    <div className="content-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      {/* EXECUTIVE HEADER */}
      <div className="glass-panel nexus-glow" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div className="logo-box" style={{ width: 60, height: 60, borderRadius: '15px' }}><UserMinus size={30} color="white"/></div>
            <div>
               <h2 className="text-gradient" style={{ margin: 0, fontSize: '1.8rem', fontWeight: 950 }}>Mobilité & Attrition</h2>
               <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.6, fontWeight: 700 }}>Analyse structurelle et prédictive des flux de talents</p>
            </div>
         </div>
         <div className="badge" style={{ background: 'rgba(52, 211, 153, 0.1)', color: 'var(--success)' }}>
            NEXUS ENGINE v8.2 ACTIVE
         </div>
      </div>

      {/* KPI GRID */}
      <div className="stats-grid">
         <MetricCard label="Taux de Turnover" value={stats.turnoverRate} suffix="%" icon={UserMinus} color="var(--danger)" subtext="Indice d'attrition période" />
         <MetricCard label="Score de Stabilité" value={stats.stabilityScore} suffix="%" icon={ShieldCheck} color="var(--success)" subtext="Rétention globale" />
         <MetricCard label="Mobilités Sortantes" value={stats.totalDeparted} icon={MoveRight} color="var(--warning)" subtext="Collaborateurs identifiés" />
         <MetricCard label="Risques Critiques" value={stats.criticalRisks} icon={BrainCircuit} color="var(--premium)" subtext="Alertes Attrition Nexus" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2.5rem' }}>
         {/* VOLUMETRIE PAR DIRECTION */}
         <div className="glass-panel chart-container">
            <div className="chart-header">
               <h3 className="chart-title">Analyse Structurelle par Direction</h3>
               <div className="badge" style={{ fontSize: '0.65rem' }}>REPARTITION DÉPARTS</div>
            </div>
            <div style={{ height: 350 }}>
               {deptData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={deptData} layout="vertical" margin={{ top: 10, right: 15, bottom: 10, left: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" fontSize={10} axisLine={true} tickLine={true} tick={{fill: 'var(--text-dim)', fontWeight: 700}} width={120} />
                        <Tooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid var(--glass-border)', borderRadius: '12px' }} />
                        <Bar dataKey="value" name="Départs" radius={[0, 10, 10, 0]} barSize={25}>
                           {deptData.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                        </Bar>
                     </BarChart>
                  </ResponsiveContainer>
               ) : (
                  <div className="empty-state">Aucun départ enregistré pour cette période.</div>
               )}
            </div>
         </div>

         {/* PREDICTIVE SEGMENTATION */}
         <div className="glass-panel chart-container">
            <div className="chart-header">
               <h3 className="chart-title">Segmentation du Risque (Nexus)</h3>
               <div className="badge" style={{ fontSize: '0.65rem', background: 'rgba(167, 139, 250, 0.1)', color: 'var(--premium)' }}>IA ENGINE</div>
            </div>
            <div style={{ height: 350 }}>
               <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={riskScatter} margin={{ top: 20, right: 20, bottom: 20, left: 15 }}>
                     <defs>
                        <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="var(--danger)" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="var(--danger)" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                     <XAxis dataKey="age" name="Age" unit=" ans" fontSize={10} tick={{fill: 'var(--text-dim)'}} axisLine={true} tickLine={true} />
                     <YAxis yAxisId="left" orientation="left" fontSize={10} tick={{fill: 'var(--text-dim)'}} axisLine={true} tickLine={true} tickFormatter={(v) => `${v}%`} />
                     <YAxis yAxisId="right" orientation="right" fontSize={10} tick={{fill: 'var(--text-dim)'}} axisLine={true} tickLine={true} tickFormatter={(v) => `${v}j`} />
                     <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid var(--glass-border)', borderRadius: '12px' }} />
                     <Bar yAxisId="right" dataKey="absences" name="Absences (Jours)" barSize={10} fill="var(--warning)" radius={[4, 4, 0, 0]} opacity={0.6} />
                     <Area yAxisId="left" type="monotone" dataKey="risk" name="Score Risque" stroke="var(--danger)" strokeWidth={3} fillOpacity={1} fill="url(#colorRisk)" />
                  </ComposedChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>

      {/* DETAILED LOG */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
         <div style={{ padding: '2rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 950 }}>Registre Stratégique des Mobilités</h3>
            <div style={{ fontSize: '0.75rem', opacity: 0.5, fontWeight: 700 }}>Total: {departed.length} Sorties</div>
         </div>
         <div style={{ padding: '0.5rem' }}>
            <table className="executive-table">
               <thead>
                  <tr>
                     <th>Collaborateur</th>
                     <th>Service</th>
                     <th>Motif Nexus</th>
                     <th>Score Risque Final</th>
                     <th>Analyse Facteurs</th>
                  </tr>
               </thead>
               <tbody>
                  {departed.length > 0 ? departed.slice(0, 10).map((e, i) => (
                     <tr key={i} className="premium-hover">
                        <td>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <div className="avatar" style={{ width: 34, height: 34, fontSize: '0.8rem', fontWeight: 950 }}>{(e.name || '??').substring(0,2)}</div>
                              <div>
                                 <div style={{ fontWeight: 850, fontSize: '0.95rem' }}>{e.name}</div>
                                 <div style={{ fontSize: '0.65rem', opacity: 0.4 }}>{e.id}</div>
                              </div>
                           </div>
                        </td>
                        <td style={{ fontSize: '0.85rem', fontWeight: 700 }}>{e.dept}</td>
                        <td><span className="badge" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>SORTIE DÉFINITIVE</span></td>
                        <td>
                           <div style={{ fontWeight: 950, color: 'var(--danger)' }}>{((e.risk_score || 0) * 100).toFixed(0)}%</div>
                        </td>
                        <td>
                           <div style={{ display: 'flex', gap: '0.5rem' }}>
                              {(e.risk_factors || 'N/A').split(' | ').slice(0, 2).map(f => (
                                 <span key={f} className="badge" style={{ fontSize: '0.6rem', padding: '2px 6px' }}>{f}</span>
                              ))}
                           </div>
                        </td>
                     </tr>
                  )) : (
                     <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem', opacity: 0.5 }}>Aucun départ répertorié dans le registre industriel.</td></tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default Page3_Turnover;
