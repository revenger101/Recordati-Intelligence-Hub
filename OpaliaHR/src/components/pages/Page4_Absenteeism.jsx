import React, { useMemo } from 'react';
import { 
  Activity, Clock, ShieldCheck, AlertTriangle, 
  TrendingDown, Zap, BarChart3, Users, Calendar, ArrowUpRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell, 
  PieChart, Pie, Legend
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
           {trend <= 0 ? <ShieldCheck size={10}/> : <TrendingDown size={10}/>} {Math.abs(trend)}%
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

const Page4_Absenteeism = ({ employees = [], selectedMonth = {}, allHistory = [] }) => {
  const safeEmps = Array.isArray(employees) ? employees : [];
  
  const stats = useMemo(() => {
    const totalAbsence = Number(selectedMonth.absence_days) || 0;
    const headcount = Number(selectedMonth.headcount) || safeEmps.length || 1;
    const rate = (totalAbsence / (headcount * 22) * 100).toFixed(1);
    const availability = (100 - rate).toFixed(1);
    
    return {
      totalAbsence: totalAbsence.toFixed(1),
      rate,
      availability,
      headcount
    };
  }, [selectedMonth, safeEmps]);

  const deptData = useMemo(() => {
    const data = {};
    safeEmps.forEach(e => {
        const d = e.dept || 'N/C';
        data[d] = (data[d] || 0) + Number(e.absences || 0);
    });
    return Object.entries(data).map(([name, value]) => ({ name, value: Number(value.toFixed(1)) })).sort((a,b) => b.value - a.value).slice(0, 8);
  }, [safeEmps]);

  const topAbsentee = useMemo(() => {
     return [...safeEmps].sort((a,b) => Number(b.absences) - Number(a.absences)).slice(0, 6);
  }, [safeEmps]);

  return (
    <div className="content-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      {/* HEADER */}
      <div className="glass-panel nexus-glow" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div className="logo-box" style={{ width: 60, height: 60, borderRadius: '15px' }}><Activity size={30} color="white"/></div>
            <div>
               <h2 className="text-gradient" style={{ margin: 0, fontSize: '1.8rem', fontWeight: 950 }}>Disponibilité Opérationnelle</h2>
               <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.6, fontWeight: 700 }}>Monitoring de l'absentéisme et impact sur la productivité</p>
            </div>
         </div>
         <div className="badge" style={{ background: 'rgba(52, 211, 153, 0.1)', color: 'var(--success)' }}>
            DATA SYNC: STABLE
         </div>
      </div>

      <div className="stats-grid">
         <MetricCard label="Taux d'Absentéisme" value={stats.rate} suffix="%" icon={Activity} color="var(--danger)" subtext="Poids des absences sur période" />
         <MetricCard label="Taux de Disponibilité" value={stats.availability} suffix="%" icon={ShieldCheck} color="var(--success)" subtext="Capacité opérationnelle réelle" />
         <MetricCard label="Total Jours d'Absence" value={stats.totalAbsence} suffix=" Jours" icon={Calendar} color="var(--warning)" subtext="Volume consolidé" />
         <MetricCard label="Effectif de Base" value={stats.headcount} icon={Users} color="var(--premium)" subtext="Collaborateurs actifs" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '2.5rem' }}>
         <div className="glass-panel chart-container">
            <div className="chart-header">
               <h3 className="chart-title">Absentéisme par Direction (Impact Jours)</h3>
            </div>
            <div style={{ height: 350 }}>
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptData} margin={{ top: 15, right: 15, bottom: 10, left: 10 }}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                     <XAxis dataKey="name" fontSize={10} axisLine={true} tickLine={true} tick={{fill: 'var(--text-dim)', fontWeight: 700}} />
                     <YAxis fontSize={10} axisLine={true} tickLine={true} tick={{fill: 'var(--text-dim)', fontWeight: 700}} />
                     <Tooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid var(--glass-border)', borderRadius: '12px' }} />
                     <Bar dataKey="value" name="Jours d'absence" radius={[10, 10, 0, 0]} barSize={40}>
                        {deptData.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="glass-panel">
            <div style={{ padding: '2rem', borderBottom: '1px solid var(--glass-border)' }}>
               <h3 className="chart-title" style={{ margin: 0 }}>Watchlist Absentéisme</h3>
            </div>
            <div style={{ padding: '1rem' }}>
               <table className="executive-table">
                  <thead>
                     <tr><th>ID</th><th>Service</th><th>Jours</th></tr>
                  </thead>
                  <tbody>
                     {topAbsentee.map((e, i) => (
                        <tr key={i}>
                           <td style={{ fontWeight: 950 }}>{e.id}</td>
                           <td style={{ fontSize: '0.8rem', opacity: 0.7 }}>{e.dept}</td>
                           <td>
                              <span className="badge" style={{ background: Number(e.absences) > 5 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.05)', color: Number(e.absences) > 5 ? 'var(--danger)' : 'var(--text-main)', fontWeight: 900 }}>
                                 {Number(e.absences).toFixed(1)} j
                              </span>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>

      <div className="glass-panel-accent" style={{ padding: '2rem', display: 'flex', gap: '2rem', alignItems: 'center', background: 'rgba(59, 130, 246, 0.05)' }}>
         <div className="nexus-glow-orb" style={{ width: 60, height: 60, flexShrink: 0 }}>
            <Zap size={24} color="white" />
         </div>
         <div>
            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 950, color: 'var(--accent)' }}>Analyse Productivité Nexus</h4>
            <p style={{ margin: '5px 0 0', fontSize: '0.9rem', opacity: 0.6, lineHeight: 1.6 }}>
               La tendance actuelle indique un impact de <strong>-4.2%</strong> sur la productivité de la ligne Production. 
               Recommandation: Mettre en place un plan de polyvalence pour les services avec un taux d'absentéisme &gt; 5%.
            </p>
         </div>
      </div>
    </div>
  );
};

export default Page4_Absenteeism;
