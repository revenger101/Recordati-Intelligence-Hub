import React, { useState, useMemo } from 'react';
import { 
  Building2, Users, UserMinus, Activity, DollarSign, ArrowLeft, 
  ChevronRight, Target, ShieldAlert, Award, TrendingUp, ShieldCheck, UserX, UserPlus, Info
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, LineChart, Line, AreaChart, Area, PieChart, Pie, Legend
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

const MetricCard = ({ label, value, trend, icon: Icon, color = 'var(--accent)', suffix = '', subtext }) => (
  <div className="glass-panel mini-card premium-hover fade-up" style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
       <div style={{ padding: '0.8rem', borderRadius: '14px', background: `rgba(${color === 'var(--accent)' ? '96, 165, 250' : color === 'var(--success)' ? '52, 211, 153' : color === 'var(--warning)' ? '251, 191, 36' : '239, 113, 113'}, 0.1)`, border: `1px solid rgba(${color === 'var(--accent)' ? '96, 165, 250' : color === 'var(--success)' ? '52, 211, 153' : color === 'var(--warning)' ? '251, 191, 36' : '239, 113, 113'}, 0.2)`, color }}>
          <Icon size={22} />
       </div>
       {trend !== undefined && (
         <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 800, color: trend >= 0 ? 'var(--success)' : 'var(--danger)', padding: '4px 10px', borderRadius: '20px', background: 'rgba(255,255,255,0.03)' }}>
           {trend >= 0 ? <TrendingUp size={12}/> : <TrendingUp size={12} style={{transform: 'rotate(180deg)'}}/>} {Math.abs(trend)}%
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

const Page8_ServiceDetail = ({ employees, onBack }) => {
  const depts = [...new Set(employees.map(e => e.dept))].filter(Boolean);
  const [selectedSvc, setSelectedSvc] = useState(depts[0] || 'FOE');

  const svcEmployees = useMemo(() => employees.filter(e => e.dept === selectedSvc && (e.statut||e.status) !== 'SORTANT'), [employees, selectedSvc]);
  
  const stats = useMemo(() => {
    const totalPayroll = svcEmployees.reduce((acc, e) => acc + (Number(e.salary || e.salaire) || 0), 0);
    const totalAbs = svcEmployees.reduce((acc, e) => acc + (Number(e.absences) || 0), 0);
    const absRate = svcEmployees.length > 0 ? ((totalAbs / (svcEmployees.length * 22)) * 100) : 0;
    
    const ages = { '18-25': 0, '26-35': 0, '36-45': 0, '46-55': 0, '56+': 0 };
    svcEmployees.forEach(e => {
       const a = Number(e.age) || 35;
       if (a <= 25) ages['18-25']++;
       else if (a <= 35) ages['26-35']++;
       else if (a <= 45) ages['36-45']++;
       else if (a <= 55) ages['46-55']++;
       else ages['56+']++;
     });

    return { totalPayroll, absRate, pyramid: Object.entries(ages).map(([name, count]) => ({ name, count })) };
  }, [svcEmployees]);

  return (
    <div className="content-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      {/* HEADER SECTION */}
      <div className="glass-panel" style={{ padding: '1.5rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(90deg, rgba(96, 165, 250, 0.05) 0%, transparent 100%)' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <button className="icon-btn" onClick={onBack} title="Retour">
               <ArrowLeft size={20}/>
            </button>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Building2 size={28} color="var(--accent)" />
                  <select 
                    value={selectedSvc} 
                    onChange={e => setSelectedSvc(e.target.value)} 
                    className="premium-select"
                    style={{ fontSize: '1.8rem', fontWeight: 950, background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none', cursor: 'pointer', letterSpacing: '-1px' }}
                  >
                     {depts.map(d => <option key={d} value={d} style={{ color: '#000', fontSize: '1rem' }}>{d}</option>)}
                  </select>
               </div>
               <p style={{ margin: 0, fontSize: '0.7rem', opacity: 0.4, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', marginLeft: '3rem' }}>Profilage Analytique de Direction</p>
            </div>
         </div>
         <div className="badge" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent)', padding: '0.8rem 1.5rem', borderRadius: '12px', fontWeight: 900, fontSize: '0.75rem', letterSpacing: '1px' }}>
            <Activity size={16} style={{ marginRight: '0.8rem' }} />
            REAL-TIME CLUSTER ANALYSIS
         </div>
      </div>

      {/* KPI ROW */}
      <div className="stats-grid">
        <MetricCard label="Effectif Actif" value={svcEmployees.length} icon={Users} color="var(--accent)" subtext="Collaborateurs en poste" trend={1.5} />
        <MetricCard label="Indice de Risque" value={68} suffix="%" trend={2.1} icon={Activity} color="var(--warning)" subtext="Vulnérabilité direction" />
        <MetricCard label="Absentéisme" value={stats.absRate.toFixed(1)} suffix="%" trend={-0.4} icon={ShieldAlert} color="var(--danger)" subtext="Impact productivité" />
        <MetricCard label="Target Disponibilité" value={98} suffix="%" icon={Target} color="var(--success)" subtext="Objectif Qualité" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '2.5rem' }}>
        <div className="glass-panel chart-container fade-up" style={{ height: 'auto', minHeight: '450px' }}>
           <div className="chart-header">
              <div>
                 <h3 className="chart-title">Démographie Directionnelle</h3>
                 <p style={{ fontSize: '0.75rem', opacity: 0.5, margin: 0 }}>Répartition par tranches d'âge (Réel)</p>
              </div>
              <Users size={18} style={{ opacity: 0.3 }} />
           </div>
           <div style={{ height: '350px' }}>
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={stats.pyramid} layout="vertical" margin={{ top: 10, right: 15, bottom: 10, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" fontSize={10} axisLine={true} tickLine={true} tick={{fill: 'var(--text-dim)', fontWeight: 700}} width={80} />
                    <Tooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid var(--glass-border)', borderRadius: '12px' }} />
                    <Bar dataKey="count" name="Effectif" radius={[0, 10, 10, 0]} barSize={35}>
                       {stats.pyramid.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} fillOpacity={1 - index * 0.1} />)}
                    </Bar>
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="glass-panel fade-up" style={{ padding: '2.5rem', animationDelay: '0.1s', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.6rem', borderRadius: '12px', background: 'rgba(167, 139, 250, 0.1)', color: 'var(--premium)' }}><Award size={22} /></div>
              <h3 className="chart-title" style={{ margin: 0 }}>Structure des Rôles</h3>
           </div>
           <div style={{ flex: 1 }}>
              <table className="executive-table">
                 <thead>
                    <tr><th>Fonction</th><th>Effectif</th><th>Poids %</th></tr>
                 </thead>
                 <tbody>
                    {[...new Set(svcEmployees.map(e => e.role))].slice(0, 7).map((role, i) => {
                       const count = svcEmployees.filter(e => e.role === role).length;
                       return (
                          <tr key={i}>
                             <td style={{ fontWeight: 800, fontSize: '0.85rem' }}>{role}</td>
                             <td style={{ fontWeight: 950, color: 'var(--accent)' }}>{count}</td>
                             <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                   <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3 }}>
                                      <div style={{ height: '100%', borderRadius: 3, width: `${(count/svcEmployees.length)*100}%`, background: 'var(--premium)', boxShadow: '0 0 10px rgba(167, 139, 250, 0.3)' }} />
                                   </div>
                                   <span style={{ fontSize: '0.75rem', fontWeight: 900, minWidth: '35px' }}>{((count/svcEmployees.length)*100).toFixed(0)}%</span>
                                </div>
                             </td>
                          </tr>
                       );
                    })}
                 </tbody>
              </table>
           </div>
        </div>
      </div>

      <div className="glass-panel fade-up" style={{ animationDelay: '0.2s' }}>
         <div style={{ padding: '2rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 950 }}>Annuaire Opérationnel : {selectedSvc}</h3>
            <button className="premium-btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>Exporter Dashboard Service</button>
         </div>
         <div style={{ padding: '1.5rem' }}>
            <table className="executive-table">
               <thead>
                  <tr><th>Collaborateur</th><th>Fonction</th><th>Indice Salarial</th><th>Risque Nexus</th><th>Statut</th></tr>
               </thead>
               <tbody>
                  {svcEmployees.slice(0, 12).map((e, i) => (
                     <tr key={i}>
                        <td>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <div className="avatar" style={{ width: 34, height: 34, fontSize: '0.8rem', fontWeight: 900 }}>{(e.name || '??').substring(0,2)}</div>
                              <div>
                                 <div style={{ fontWeight: 850, fontSize: '0.95rem' }}>{e.name || 'Anonyme'}</div>
                                 <div style={{ fontSize: '0.65rem', opacity: 0.4 }}>{e.id}</div>
                              </div>
                           </div>
                        </td>
                        <td style={{ fontSize: '0.85rem', fontWeight: 700 }}>{e.role}</td>
                        <td style={{ fontWeight: 950, color: 'var(--success)', fontSize: '1.1rem' }}>
                           {(Number(e.salary||e.salaire)||0).toLocaleString()} <span style={{fontSize:'0.7rem', opacity: 0.5}}>TND</span>
                        </td>
                        <td>
                           <div style={{ width: '100px', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${(e.risk_score||0)*100}%`, height: '100%', background: (e.risk_score||0) > 0.7 ? 'var(--danger)' : 'var(--accent)', boxShadow: `0 0 10px ${(e.risk_score||0) > 0.7 ? 'var(--danger)' : 'var(--accent)'}44` }} />
                           </div>
                        </td>
                        <td>
                           <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', fontWeight: 900, fontSize: '0.65rem' }}>ACTIVE</span>
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

export default Page8_ServiceDetail;
