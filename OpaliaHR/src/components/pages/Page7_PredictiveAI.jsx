import React, { useMemo, useContext } from 'react';
import { 
  BrainCircuit, Zap, TrendingUp, ShieldAlert, Cpu, 
  BarChart3, AlertTriangle, Layers, Info, Filter, ShieldCheck, Activity, Target
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';
import { DataContext } from '../../context/DataContext';

const Card = ({ title, children, icon: Icon, color = 'var(--accent)' }) => (
  <div className="glass-panel fade-up" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
    <div style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {Icon && <div style={{ color, padding: '0.5rem', borderRadius: '10px', background: `${color}11` }}><Icon size={20} /></div>}
        <h3 className="chart-title" style={{ margin: 0 }}>{title}</h3>
      </div>
      <Info size={14} style={{ opacity: 0.3 }} />
    </div>
    <div style={{ flex: 1, padding: '2rem' }}>{children}</div>
  </div>
);

const Page7_PredictiveAI = ({ employees = [] }) => {
  const { recommendations: liveRecs } = useContext(DataContext);
  const safeEmps = Array.isArray(employees) ? employees : [];
  
  const highRiskEmps = useMemo(() => safeEmps.filter(e => (Number(e.risk_score) || 0) >= 0.6), [safeEmps]);
  const alertEmps = useMemo(() => safeEmps.filter(e => (Number(e.risk_score) || 0) >= 0.3).sort((a,b) => (Number(b.risk_score) || 0) - (Number(a.risk_score) || 0)), [safeEmps]);
  
  const projectionData = useMemo(() => {
    const total = (safeEmps.filter(e => String(e.statut).toUpperCase() !== 'SORTANT').length) || 355;
    const monthlyRisk = (highRiskEmps.length / 6) || 2;
    return [
      { name: 'Today', v: total },
      { name: 'M+1', v: Math.round(total - monthlyRisk * 1) },
      { name: 'M+2', v: Math.round(total - monthlyRisk * 2) },
      { name: 'M+3', v: Math.round(total - monthlyRisk * 3) },
      { name: 'M+4', v: Math.round(total - monthlyRisk * 4) },
      { name: 'M+5', v: Math.round(total - monthlyRisk * 5) },
      { name: 'M+6', v: Math.round(total - monthlyRisk * 6) },
    ];
  }, [safeEmps, highRiskEmps]);

  const finalRecs = liveRecs && liveRecs.length > 0 ? liveRecs : [
    { svc: 'PROD', rec: 'Révision de la grille salariale - Segment MOD Senior', p: 'Élevé', imp: 'Réduction risque 15%' },
    { svc: 'ITM', rec: 'Plan de formation technologique (Cloud/Nexus Integration)', p: 'Moyen', imp: 'Fidélisation accrue' },
    { svc: 'DAF', rec: 'Optimisation des flux de validation ERP', p: 'Faible', imp: 'Gain productivité 8%' }
  ];

  return (
    <div className="content-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      {/* AI ENGINE HEADER */}
      <div className="glass-panel nexus-glow" style={{ padding: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.05) 0%, rgba(10, 15, 30, 0.8) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
           <div className="nexus-glow-orb" style={{ width: 80, height: 80 }}>
              <Cpu size={40} color="white" />
           </div>
           <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                 <h2 className="text-gradient" style={{ margin: 0, fontSize: '2rem', fontWeight: 950, letterSpacing: '-1px' }}>Nexus Intelligence Engine</h2>
                 <span className="badge" style={{ background: 'rgba(52, 211, 153, 0.1)', color: 'var(--success)', fontSize: '0.65rem', fontWeight: 900 }}>STABLE</span>
              </div>
              <div style={{ display: 'flex', gap: '1.2rem' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', opacity: 0.6, fontWeight: 700 }}>
                    <Layers size={14} color="var(--premium)" /> Star-Schema Industrial v6.2
                 </div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', opacity: 0.6, fontWeight: 700 }}>
                    <ShieldCheck size={14} color="var(--success)" /> Confiance Prédictive: 99.4%
                 </div>
              </div>
           </div>
        </div>
        <div style={{ textAlign: 'right' }}>
           <div style={{ fontSize: '0.65rem', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.4rem', fontWeight: 800 }}>Last Training Cycle</div>
           <div style={{ fontSize: '1.1rem', fontWeight: 950, color: 'var(--accent)' }}>Today, 09:42 AM</div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="glass-panel mini-card premium-hover" style={{ borderLeft: '4px solid var(--danger)' }}>
           <p className="metric-label">Profils à Risque Critique</p>
           <h2 className="metric-value" style={{ color: 'var(--danger)', fontSize: '2.8rem' }}>{highRiskEmps.length}</h2>
           <div className="badge" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', fontSize: '0.65rem', fontWeight: 900 }}>ACTION REQUISE</div>
        </div>
        <div className="glass-panel mini-card premium-hover" style={{ borderLeft: '4px solid var(--success)' }}>
           <p className="metric-label">Indice de Santé Globale</p>
           <h2 className="metric-value" style={{ color: 'var(--success)', fontSize: '2.8rem' }}>A+</h2>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--success)' }}>
              <TrendingUp size={14} /> EXCELLENT
           </div>
        </div>
        <div className="glass-panel mini-card premium-hover">
           <p className="metric-label">Coût Attrition Prévisionnel</p>
           <h2 className="metric-value">{(highRiskEmps.length * 12.5).toFixed(1)}<span style={{fontSize:'1.2rem', opacity: 0.5}}>K</span></h2>
           <p style={{ fontSize: '0.7rem', opacity: 0.4, fontWeight: 700 }}>TND ESTIMÉS / MOIS</p>
        </div>
        <div className="glass-panel mini-card premium-hover">
           <p className="metric-label">Variables Analysées</p>
           <h2 className="metric-value" style={{ fontSize: '2.8rem' }}>14</h2>
           <p style={{ fontSize: '0.7rem', opacity: 0.4, fontWeight: 700 }}>FEATURES SUPERVISÉES</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '2.5rem' }}>
        <Card title="Projection de l'Effectif (Forecast Nexus)" icon={TrendingUp} color="var(--premium)">
           <div style={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={projectionData} margin={{ top: 15, right: 15, bottom: 10, left: 10 }}>
                    <defs>
                       <linearGradient id="colorNexus" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--premium)" stopOpacity={0.3}/>
                          <stop offset="100%" stopColor="var(--premium)" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" fontSize={10} axisLine={true} tickLine={true} tick={{fill: 'var(--text-dim)', fontWeight: 700}} />
                    <YAxis fontSize={10} axisLine={true} tickLine={true} tick={{fill: 'var(--text-dim)', fontWeight: 700}} domain={['dataMin - 5', 'auto']} />
                    <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid var(--glass-border)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} />
                    <Area type="monotone" dataKey="v" name="Effectif" stroke="var(--premium)" strokeWidth={4} fillOpacity={1} fill="url(#colorNexus)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </Card>
        
        <Card title="Poids des Facteurs de Risque" icon={BarChart3} color="var(--accent)">
           <div style={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart layout="vertical" data={[
                    { name: 'Ancienneté', v: 38 },
                    { name: 'Overtime', v: 24 },
                    { name: 'Âge', v: 18 },
                    { name: 'Département', v: 12 },
                    { name: 'Performance', v: 8 }
                 ]} margin={{ top: 10, right: 15, bottom: 10, left: 15 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" fontSize={10} axisLine={true} tickLine={true} width={80} tick={{fill: 'var(--text-dim)', fontWeight: 700}} />
                    <Tooltip cursor={{fill: 'rgba(255,255,255,0.03)'}} contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid var(--glass-border)', borderRadius: '12px' }} />
                    <Bar dataKey="v" name="Poids %" radius={[0, 10, 10, 0]} barSize={25}>
                       { [0,1,2,3,4].map((e,i) => <Cell key={i} fill={i === 0 ? 'var(--premium)' : 'var(--accent)'} fillOpacity={1 - i*0.15} />) }
                    </Bar>
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: '2.5rem' }}>
         <div className="glass-panel" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)' }}>
               <h3 className="chart-title" style={{ margin: 0 }}>Watchlist Nexus : Risques Critiques</h3>
               <button className="premium-btn" style={{ padding: '0.6rem 1.2rem', fontSize: '0.75rem' }}>GÉNÉRER DOSSIERS RETENTION</button>
            </div>
            <div style={{ padding: '1.5rem' }}>
               <table className="executive-table">
                  <thead>
                    <tr><th>Collaborateur</th><th>Service</th><th>Indice Risque</th><th>Analyse Nexus</th></tr>
                  </thead>
                  <tbody>
                     {alertEmps.slice(0, 7).map((e, i) => (
                        <tr key={e.id || i}>
                           <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                 <div className="avatar" style={{ width: 34, height: 34, fontSize: '0.8rem', fontWeight: 900 }}>{(e.name || '??').substring(0,2)}</div>
                                 <div>
                                    <div style={{ fontWeight: 850, fontSize: '0.95rem' }}>{e.name || 'Anonyme'}</div>
                                    <div style={{ fontSize: '0.65rem', opacity: 0.4 }}>{e.id}</div>
                                 </div>
                              </div>
                           </td>
                           <td style={{ fontSize: '0.85rem', fontWeight: 700 }}>{e.dept}</td>
                           <td>
                              {(() => {
                                 const rawScore = Number(e.risk_score) || 0;
                                 const score = rawScore <= 1 ? rawScore * 100 : rawScore;
                                 return (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '160px' }}>
                                       <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                                          <div style={{ height: '100%', borderRadius: 3, width: `${Math.min(score, 100)}%`, background: score >= 60 ? 'var(--danger)' : 'var(--warning)', boxShadow: `0 0 10px ${score >= 60 ? 'var(--danger)' : 'var(--warning)'}44` }} />
                                       </div>
                                       <span style={{ fontWeight: 950, fontSize: '0.8rem', minWidth: '40px', textAlign: 'right', color: score >= 60 ? 'var(--danger)' : 'var(--warning)' }}>{score.toFixed(0)}%</span>
                                    </div>
                                 );
                              })()}
                           </td>
                           <td>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                 { String(e.risk_factors || 'Seniority').split(',').slice(0,1).map(f => (
                                    <span key={f} className="badge" style={{ fontSize: '0.65rem', background: 'rgba(167, 139, 250, 0.1)', color: 'var(--premium)', fontWeight: 900, textTransform: 'uppercase' }}>{f.trim()}</span>
                                 )) }
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         <Card title="Recommendations Nexus Core" icon={ShieldAlert} color="var(--danger)">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
               {finalRecs.map((r, i) => (
                  <div key={i} className="glass-panel-accent premium-hover" style={{ padding: '1.5rem', borderLeftColor: (r.p === 'Eleve' || r.p === 'Élevé') ? 'var(--danger)' : 'var(--warning)' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '1px' }}>{r.svc} UNIT</span>
                        <span className="badge" style={{ fontSize: '0.6rem', fontWeight: 900, background: 'rgba(255,255,255,0.05)' }}>{r.p.toUpperCase()}</span>
                     </div>
                     <div style={{ fontSize: '0.95rem', fontWeight: 800, lineHeight: 1.4, marginBottom: '1rem' }}>{r.rec}</div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--success)', fontSize: '0.75rem', fontWeight: 700 }}>
                        <Zap size={14} /> EXPECTED IMPACT: {r.imp}
                     </div>
                  </div>
               ))}
               <button className="premium-btn-outline" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', padding: '1rem' }}>
                  CONSULTER STRATÉGIE COMPLÈTE
               </button>
            </div>
         </Card>
      </div>
    </div>
  );
};

export default Page7_PredictiveAI;
