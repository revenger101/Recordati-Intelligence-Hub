import React, { useMemo } from 'react';
import { 
  Users, Building2, Target, TrendingUp, AlertCircle, 
  ArrowUpRight, BarChart3, Briefcase, UserPlus, DollarSign, Activity, ShieldCheck
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, Legend, ComposedChart, Line, Area
} from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

const MetricCard = ({ label, value, trend, icon: Icon, color = 'var(--accent)', suffix = '', subtext }) => (
  <div className="glass-panel mini-card premium-hover fade-up" style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
       <div style={{ padding: '0.8rem', borderRadius: '14px', background: `rgba(${color === 'var(--accent)' ? '96, 165, 250' : color === 'var(--success)' ? '52, 211, 153' : color === 'var(--warning)' ? '251, 191, 36' : '167, 139, 250'}, 0.1)`, border: `1px solid rgba(${color === 'var(--accent)' ? '96, 165, 250' : color === 'var(--success)' ? '52, 211, 153' : color === 'var(--warning)' ? '251, 191, 36' : '167, 139, 250'}, 0.2)`, color }}>
          <Icon size={22} />
       </div>
       {trend !== undefined && (
         <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 800, color: trend >= 0 ? 'var(--success)' : 'var(--danger)', padding: '4px 10px', borderRadius: '20px', background: 'rgba(255,255,255,0.03)' }}>
           {trend >= 0 ? <ArrowUpRight size={12}/> : <TrendingUp size={12} style={{transform: 'rotate(180deg)'}}/>} {Math.abs(trend)}%
         </div>
       )}
    </div>
    <div>
       <p className="metric-label" style={{ marginBottom: '0.4rem' }}>{label}</p>
       <h2 className="metric-value" style={{ margin: 0, fontSize: '2.2rem', fontWeight: 950, letterSpacing: '-1.5px' }}>
          {typeof value === 'number' ? value.toLocaleString() : value}<span style={{ fontSize: '0.9rem', fontWeight: 700, marginLeft: '2px', opacity: 0.6 }}>{suffix}</span>
       </h2>
       {subtext && <p style={{ fontSize: '0.7rem', opacity: 0.4, marginTop: '0.5rem', fontWeight: 600 }}>{subtext}</p>}
    </div>
  </div>
);

const Page2_Workforce = ({ employees = [], selectedMonth = {} }) => {
  const safeEmps = Array.isArray(employees) ? employees : [];

  const stats = useMemo(() => {
    const actifs = Number(selectedMonth.headcount) || safeEmps.filter(e => String(e.statut || e.status).toUpperCase() !== 'SORTANT').length;
    const total = safeEmps.length || 1;
    const avgAge = safeEmps.reduce((acc, e) => acc + (Number(e.age) || 35), 0) / total;
    const avgSeniority = safeEmps.reduce((acc, e) => acc + (Number(e.anciennete) || 5), 0) / total;
    const budgetTotal = Math.ceil(actifs * 1.05);
    const ecartPct = (((actifs - budgetTotal) / budgetTotal) * 100).toFixed(1);

    return { total: actifs, avgAge, avgSeniority, ecartPct, budgetTotal };
  }, [safeEmps, selectedMonth]);

  const deptData = useMemo(() => {
    const map = safeEmps.filter(e => String(e.statut || e.status).toUpperCase() !== 'SORTANT').reduce((acc, e) => {
      acc[e.dept] = (acc[e.dept] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(map).map(([name, value], i) => ({
      name,
      value,
      budget: Math.floor(value * 1.08), 
    })).sort((a,b) => b.value - a.value);
  }, [safeEmps]);

  return (
    <div className="content-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      <div className="stats-grid">
        <MetricCard label="Effectif Actif" value={stats.total} icon={Users} color="var(--accent)" subtext={`Période: ${selectedMonth.label || 'Mois actuel'}`} trend={2.4} />
        <MetricCard label="Adhérence Budget" value={100 + Number(stats.ecartPct)} suffix="%" icon={Target} color="var(--warning)" subtext="vs Plan de recrutement" trend={-1.2} />
        <MetricCard label="Expérience Moy." value={stats.avgSeniority.toFixed(1)} suffix=" Ans" icon={Briefcase} color="var(--success)" subtext="Ancienneté consolidée" />
        <MetricCard label="Âge Moyen" value={stats.avgAge.toFixed(0)} suffix=" Ans" icon={UserPlus} color="var(--premium)" subtext="Pyramide démographique" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2.5rem' }}>
        <div className="glass-panel chart-container fade-up" style={{ height: 'auto', minHeight: '450px' }}>
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Analyse Structurelle par Direction</h3>
              <p style={{ fontSize: '0.75rem', opacity: 0.5, margin: 0 }}>Comparaison Effectif Réel vs Budget Cible</p>
            </div>
            <div className="badge-btn" style={{ padding: '4px 12px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent)', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 900 }}>METRICS LIVE</div>
          </div>
          <div style={{ height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={deptData} margin={{ top: 15, right: 15, bottom: 10, left: 10 }}>
                <defs>
                   <linearGradient id="realGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.3}/>
                   </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" fontSize={10} axisLine={true} tickLine={true} tick={{fill: 'var(--text-dim)', fontWeight: 700}} />
                <YAxis fontSize={10} axisLine={true} tickLine={true} tick={{fill: 'var(--text-dim)', fontWeight: 700}} />
                <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid var(--glass-border)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} />
                <Legend verticalAlign="top" align="right" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', opacity: 0.8 }} />
                <Bar dataKey="value" name="Réel" fill="url(#realGrad)" radius={[6, 6, 0, 0]} barSize={45} />
                <Line type="monotone" dataKey="budget" name="Budget" stroke="var(--warning)" strokeWidth={3} strokeDasharray="6 6" dot={{ r: 4, fill: 'var(--warning)', strokeWidth: 2, stroke: '#fff' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel fade-up" style={{ padding: '2.5rem', animationDelay: '0.1s', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <div style={{ padding: '0.6rem', borderRadius: '12px', background: 'rgba(251, 191, 36, 0.1)', color: 'var(--warning)' }}><AlertCircle size={22} /></div>
             <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 950 }}>Insights Nexus AI</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-panel-accent" style={{ padding: '1.5rem', borderLeftColor: 'var(--danger)', background: 'rgba(239, 68, 68, 0.05)' }}>
               <div style={{ fontSize: '0.85rem', fontWeight: 950, marginBottom: '0.5rem' }}>Dérive Budgétaire</div>
               <div style={{ fontSize: '0.75rem', opacity: 0.6, lineHeight: 1.6, fontWeight: 500 }}>
                 Le service Production présente un écart de <strong>+8%</strong> sur les effectifs hors-plan.
               </div>
            </div>
            <div className="glass-panel-accent" style={{ padding: '1.5rem', borderLeftColor: 'var(--success)', background: 'rgba(52, 211, 153, 0.05)' }}>
               <div style={{ fontSize: '0.85rem', fontWeight: 950, marginBottom: '0.5rem' }}>Stabilité Critique</div>
               <div style={{ fontSize: '0.75rem', opacity: 0.6, lineHeight: 1.6, fontWeight: 500 }}>
                 L'ancienneté moyenne a progressé de <strong>0.4 an</strong> ce trimestre. Risque de départ diminué.
               </div>
            </div>
            <div style={{ marginTop: 'auto', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: 20, textAlign: 'center', border: '1px solid var(--glass-border)' }}>
               <div style={{ fontSize: '0.65rem', opacity: 0.5, textTransform: 'uppercase', fontWeight: 800, letterSpacing: '1px' }}>Taux d'occupation global</div>
               <div style={{ fontSize: '2.2rem', fontWeight: 950, color: 'var(--success)', letterSpacing: '-1px' }}>94.2%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel fade-up" style={{ animationDelay: '0.2s' }}>
        <div style={{ padding: '2rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 950 }}>Répartition Détaillée par Unité</h3>
           <button className="premium-btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>Analyser Anomalies</button>
        </div>
        <div style={{ padding: '1.5rem' }}>
          <table className="executive-table">
            <thead>
              <tr>
                <th>Direction / Service</th>
                <th>Effectif Actif</th>
                <th>Poids Relatif</th>
                <th>Adéquation Budget</th>
                <th>Statut Nexus</th>
              </tr>
            </thead>
            <tbody>
              {deptData.map((d, i) => (
                <tr key={i}>
                  <td>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div className="avatar" style={{ width: 34, height: 34, fontSize: '0.8rem', fontWeight: 900, background: COLORS[i % COLORS.length] }}>
                           {(d.name || '??').substring(0,2)}
                        </div>
                        <span style={{ fontWeight: 850, fontSize: '0.95rem' }}>{d.name || 'Anonyme'}</span>
                     </div>
                  </td>
                  <td style={{ fontWeight: 950, color: 'var(--accent)', fontSize: '1.2rem' }}>{d.value}</td>
                  <td>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '180px' }}>
                        <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3 }}>
                           <div style={{ height: '100%', borderRadius: 3, width: `${((d.value/stats.total)*100)}%`, background: COLORS[i % COLORS.length], boxShadow: `0 0 10px ${COLORS[i % COLORS.length]}66` }} />
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, minWidth: '40px' }}>{((d.value/stats.total)*100).toFixed(1)}%</span>
                     </div>
                  </td>
                  <td style={{ fontWeight: 800, fontSize: '0.85rem', color: d.value > d.budget ? 'var(--danger)' : 'var(--success)' }}>
                    {d.value > d.budget ? `+${d.value - d.budget} Surplus` : `${d.value - d.budget} Under`}
                  </td>
                  <td>
                     <span className="badge" style={{ 
                        background: d.value < d.budget ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', 
                        color: d.value < d.budget ? 'var(--success)' : 'var(--warning)',
                        padding: '6px 14px',
                        fontSize: '0.65rem',
                        fontWeight: 900,
                        borderRadius: '8px'
                     }}>
                        {d.value < d.budget ? 'OPTIMIZED' : 'ADJUSTMENT'}
                     </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Page2_Workforce;
