import React from 'react';
import { 
  UserPlus, Clock, Target, CheckCircle2, TrendingUp, Search, 
  ArrowUpRight, BarChart3, Users, Filter, Briefcase
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, PieChart, Pie, Legend, LineChart, Line, AreaChart, Area
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

const MetricCard = ({ label, value, trend, icon: Icon, color = 'var(--accent)', suffix = '', subtext }) => (
  <div className="glass-panel mini-card premium-hover fade-up">
    <div className="metric-header">
      <div className="metric-icon-box" style={{ color }}>
        <Icon size={22} />
      </div>
      {trend && (
        <div className={`trend-indicator ${trend > 0 ? 'up' : 'down'}`}>
          {trend > 0 ? <ArrowUpRight size={12} /> : <Clock size={12} />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <div className="metric-content">
      <p className="metric-label">{label}</p>
      <h2 className="metric-value">
        {typeof value === 'number' ? value.toLocaleString() : (value || '0')}
        <span style={{ fontSize: '0.9rem', opacity: 0.5 }}>{suffix}</span>
      </h2>
      {subtext && <p style={{ fontSize: '0.65rem', opacity: 0.4, margin: 0 }}>{subtext}</p>}
    </div>
  </div>
);

const Page6_Recruitment = () => {
  const evolutionRecruit = [
    { name: 'Sept', v: 4 }, { name: 'Oct', v: 2 }, { name: 'Nov', v: 8 }, { name: 'Déc', v: 12 }, { name: 'Jan 26', v: 5 }, { name: 'Fév 26', v: 3 }
  ];

  const sourcingData = [
     { name: 'Candidature Dir.', value: 45 },
     { name: 'Cooptation', value: 30 },
     { name: 'Cabinets', value: 15 },
     { name: 'Interne', value: 10 }
  ];

  const funnelData = [
     { stage: 'Sourcing', value: 450, fill: '#3b82f6' },
     { stage: 'Screening', value: 120, fill: '#8b5cf6' },
     { stage: 'Interviews', value: 45, fill: '#10b981' },
     { stage: 'Offers', value: 12, fill: '#f59e0b' },
     { stage: 'Hired', value: 8, fill: '#ef4444' }
  ];

  return (
    <div className="content-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* KPI ROW */}
      <div className="stats-grid">
        <MetricCard 
          label="Time to Hire" 
          value={38} 
          suffix=" Jours"
          trend={-12}
          icon={Clock} 
          color="var(--accent)" 
          subtext="Délai moyen de recrutement"
        />
        <MetricCard 
          label="Passage Essai" 
          value={94.5} 
          suffix="%"
          trend={+2.1}
          icon={CheckCircle2} 
          color="var(--success)" 
          subtext="Qualité du sourcing"
        />
        <MetricCard 
          label="Nouveaux Talents" 
          value={12} 
          icon={UserPlus} 
          color="var(--premium)" 
          subtext="Intégrations (YTD 2026)"
        />
        <MetricCard 
          label="Postes Ouverts" 
          value={14} 
          icon={Briefcase} 
          color="var(--warning)" 
          subtext="Besoins actifs identifiés"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
        <div className="glass-panel chart-container fade-up">
          <div className="chart-header">
            <h3 className="chart-title">Dynamique de Recrutement (Mensuel)</h3>
          </div>
          <div style={{ height: '320px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={evolutionRecruit} margin={{ top: 15, right: 15, bottom: 10, left: 10 }}>
                <defs>
                  <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" fontSize={10} axisLine={true} tickLine={true} tick={{fill: 'var(--text-dim)'}} />
                <YAxis fontSize={10} axisLine={true} tickLine={true} tick={{fill: 'var(--text-dim)'}} />
                <Tooltip 
                  contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}
                />
                <Area type="stepAfter" dataKey="v" name="Recrutements" stroke="var(--accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorRec)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel chart-container fade-up" style={{ animationDelay: '0.1s' }}>
          <div className="chart-header">
            <h3 className="chart-title">Canaux de Sourcing</h3>
          </div>
          <div style={{ height: '320px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={sourcingData} 
                  innerRadius={60} 
                  outerRadius={90} 
                  paddingAngle={8} 
                  dataKey="value"
                  stroke="none"
                >
                  {sourcingData.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid var(--glass-border)', borderRadius: '12px' }} />
                <Legend verticalAlign="bottom" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
        <div className="glass-panel fade-up" style={{ animationDelay: '0.2s' }}>
           <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900 }}>Entonnoir de Conversion</h3>
              <Filter size={18} style={{ opacity: 0.3 }} />
           </div>
           <div style={{ height: '350px', padding: '1.5rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} layout="vertical" margin={{ top: 10, right: 15, bottom: 10, left: 15 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="stage" fontSize={10} axisLine={true} tickLine={true} width={80} tick={{fill: 'var(--text-dim)'}} />
                  <Tooltip cursor={{fill: 'rgba(255,255,255,0.03)'}} contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid var(--glass-border)', borderRadius: '12px' }} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={35}>
                    {funnelData.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="glass-panel fade-up" style={{ animationDelay: '0.3s' }}>
           <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900 }}>Opportunités Actives</h3>
              <button className="premium-btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem' }}>Nouveau Poste</button>
           </div>
           <div style={{ padding: '1rem' }}>
              <table className="executive-table">
                <thead>
                  <tr>
                    <th>Direction</th>
                    <th>Poste</th>
                    <th>Volume Candidats</th>
                    <th>Status / Priorité</th>
                  </tr>
                </thead>
                <tbody>
                   {[
                      { svc: 'ITM', job: 'Senior Developer', cand: 42, p: 'HAUTE', fill: 'var(--danger)' },
                      { svc: 'FOE', job: 'Opérateur Machine', cand: 15, p: 'MOYENNE', fill: 'var(--warning)' },
                      { svc: 'DAF', job: 'Contrôleur Gestion', cand: 12, p: 'BASSE', fill: 'var(--accent)' },
                      { svc: 'LOG', job: 'Chef de Quai', cand: 8, p: 'HAUTE', fill: 'var(--danger)' }
                   ].map((j, i) => (
                      <tr key={i}>
                         <td style={{ fontWeight: 800 }}>{j.svc}</td>
                         <td style={{ fontSize: '0.85rem', fontWeight: 700 }}>{j.job}</td>
                         <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                               <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3 }}>
                                  <div style={{ height: '100%', borderRadius: 3, width: `${Math.min(j.cand*2, 100)}%`, background: 'var(--accent)' }} />
                               </div>
                               <span style={{ fontWeight: 800 }}>{j.cand}</span>
                            </div>
                         </td>
                         <td>
                            <span className="badge" style={{ background: `${j.fill}15`, color: j.fill }}>
                               {j.p}
                            </span>
                         </td>
                      </tr>
                   ))}
                </tbody>
              </table>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Page6_Recruitment;

