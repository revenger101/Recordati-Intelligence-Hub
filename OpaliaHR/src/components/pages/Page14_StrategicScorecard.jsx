import React, { useMemo } from 'react';
import { 
  Target, TrendingUp, Users, UserMinus, DollarSign, GraduationCap, 
  Heart, Zap, ShieldCheck, BarChart3, Award, Info, 
  ArrowUpRight, TrendingDown, Activity, ShieldAlert
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Cell, LineChart, Line, AreaChart, Area, Legend
} from 'recharts';

const ScorecardGroup = ({ title, icon: Icon, color, children, description }) => (
  <div className="glass-panel fade-up" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
    <div style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ color, padding: '0.6rem', borderRadius: '12px', background: `${color}11` }}><Icon size={20} /></div>
        <div>
          <h3 className="chart-title" style={{ margin: 0 }}>{title}</h3>
          {description && <p style={{ margin: 0, fontSize: '0.7rem', opacity: 0.4, fontWeight: 700 }}>{description}</p>}
        </div>
      </div>
      <div className="badge" style={{ background: `${color}10`, color, fontSize: '0.65rem', fontWeight: 900 }}>PILOTAGE</div>
    </div>
    <div style={{ padding: '2rem', flex: 1 }}>{children}</div>
  </div>
);

const IndicatorRow = ({ label, value, suffix, trend, color }) => (
  <div style={{ marginBottom: '1.5rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.6rem' }}>
      <span style={{ fontSize: '0.8rem', fontWeight: 800, opacity: 0.6 }}>{label}</span>
      <div style={{ textAlign: 'right' }}>
        <span style={{ fontSize: '1.4rem', fontWeight: 950, letterSpacing: '-1px' }}>{value}<span style={{ fontSize: '0.8rem', opacity: 0.4, marginLeft: '2px', fontWeight: 700 }}>{suffix}</span></span>
      </div>
    </div>
    <div style={{ width: '100%', height: 8, background: 'rgba(255,255,255,0.03)', borderRadius: 4, overflow: 'hidden', position: 'relative', border: '1px solid var(--glass-border)' }}>
      <div 
        style={{ 
          height: '100%', 
          width: `${Math.min(value > 100 ? 100 : value, 100)}%`, 
          background: color, 
          borderRadius: 4,
          boxShadow: `0 0 15px ${color}44`
        }} 
      />
    </div>
    {trend && (
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontSize: '0.65rem', color: trend > 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 900, textTransform: 'uppercase' }}>
        {trend > 0 ? <ArrowUpRight size={12} /> : <TrendingDown size={12} />}
        {Math.abs(trend)}% vs mois précédent
      </div>
    )}
  </div>
);

const Page14_StrategicScorecard = ({ selectedMonth = {}, allHistory = [] }) => {
  const safeHistory = Array.isArray(allHistory) ? allHistory : [];
  const safeMonth = selectedMonth || {};
  const stats = safeMonth.strategic || {
    turnoverGlobal: 5.2,
    retentionKeys: 94,
    internsRate: 2.8,
    availabilityRate: 92.4,
    qualificationRate: 62,
    promotionRate: 12.5,
    satisfactionScore: 4.2
  };

  const radarData = [
    { subject: 'Rétention', A: Number(stats.retentionKeys) || 0, fullMark: 100 },
    { subject: 'Dispo', A: Number(stats.availabilityRate) || 0, fullMark: 100 },
    { subject: 'Qualif', A: Number(stats.qualificationRate) || 0, fullMark: 100 },
    { subject: 'Satisf.', A: (Number(stats.satisfactionScore) || 0) * 20, fullMark: 100 },
    { subject: 'Promo', A: (Number(stats.promotionRate) || 0) * 4, fullMark: 100 },
    { subject: 'Stages', A: (Number(stats.internsRate) || 0) * 10, fullMark: 100 },
  ];

  return (
    <div className="content-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      {/* HEADER SECTION */}
      <div className="glass-panel nexus-glow" style={{ padding: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, rgba(242, 200, 17, 0.05) 0%, rgba(10, 15, 30, 0.8) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div className="nexus-glow-orb" style={{ width: 70, height: 70, background: 'var(--premium)', boxShadow: '0 0 30px rgba(167, 139, 250, 0.4)' }}>
            <Award size={32} color="white" />
          </div>
          <div>
            <h2 className="text-gradient" style={{ margin: 0, fontSize: '2.2rem', fontWeight: 950, letterSpacing: '-1.5px' }}>Tableau de Bord Stratégique RH</h2>
            <p style={{ margin: '6px 0 0', fontSize: '0.8rem', opacity: 0.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px' }}>Référentiel Recordati Industrial v6.2</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1rem 2rem', borderLeft: '4px solid var(--success)', background: 'rgba(52, 211, 153, 0.05)' }}>
             <p className="metric-label" style={{ fontSize: '0.65rem', marginBottom: '0.2rem' }}>Global Health Index</p>
             <h3 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 950, color: 'var(--success)', letterSpacing: '-1px' }}>88.4%</h3>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2.5rem' }}>
        
        <ScorecardGroup title="Rétention & Mobilité" icon={UserMinus} color="#ef4444" description="Stabilité du capital humain">
          <IndicatorRow label="Taux Turnover Global" value={stats.turnoverGlobal} suffix="%" trend={-0.4} color="#ef4444" />
          <IndicatorRow label="Rétention Positions Clés" value={stats.retentionKeys} suffix="%" trend={+1.2} color="#10b981" />
          <IndicatorRow label="Taux Stagiaires & PFE" value={stats.internsRate} suffix="%" color="var(--accent)" />
          <div className="glass-panel-accent" style={{ marginTop: '2rem', padding: '1.5rem', borderLeftColor: '#ef4444', background: 'rgba(239, 68, 68, 0.05)' }}>
            <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 950, marginBottom: '0.4rem' }}>Strategic Insight:</p>
            <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.7, lineHeight: 1.5, fontWeight: 500 }}>Le turnover volontaire est en phase de stabilisation. Focus recommandé sur les doublons ITM.</p>
          </div>
        </ScorecardGroup>

        <ScorecardGroup title="Performance & Coûts" icon={DollarSign} color="var(--accent)" description="Optimisation des ratios MS">
          <IndicatorRow label="Disponibilité Opérationnelle" value={stats.availabilityRate} suffix="%" trend={+0.5} color="var(--accent)" />
          <IndicatorRow label="Coût Moyen / Collab." value={2450} suffix=" TND" color="var(--premium)" />
          <div style={{ height: 120, marginTop: '2rem', borderRadius: '15px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={safeHistory.slice(-6)}>
                   <defs>
                      <linearGradient id="scoreArea" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.2}/>
                         <stop offset="100%" stopColor="var(--accent)" stopOpacity={0}/>
                      </linearGradient>
                   </defs>
                   <Area type="monotone" dataKey="headcount" stroke="var(--accent)" strokeWidth={3} fill="url(#scoreArea)" />
                </AreaChart>
             </ResponsiveContainer>
          </div>
        </ScorecardGroup>

        <ScorecardGroup title="Talent & Compétences" icon={GraduationCap} color="var(--premium)" description="Développement des assets immatériels">
          <IndicatorRow label="Taux de Qualification" value={stats.qualificationRate} suffix="%" color="var(--premium)" />
          <IndicatorRow label="Taux d'Encadrement" value={18.5} suffix="%" color="var(--accent)" />
          <IndicatorRow label="Compliance Formation" value={85} suffix="%" trend={+5.0} color="#10b981" />
          <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
             <div className="glass-panel" style={{ textAlign: 'center', padding: '1.2rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 950, letterSpacing: '-1px' }}>420h</div>
                <div style={{ fontSize: '0.6rem', opacity: 0.5, textTransform: 'uppercase', fontWeight: 800, marginTop: '0.4rem' }}>Volume Global</div>
             </div>
             <div className="glass-panel" style={{ textAlign: 'center', padding: '1.2rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 950, letterSpacing: '-1px' }}>92%</div>
                <div style={{ fontSize: '0.6rem', opacity: 0.5, textTransform: 'uppercase', fontWeight: 800, marginTop: '0.4rem' }}>ROI Training</div>
             </div>
          </div>
        </ScorecardGroup>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '2.5rem' }}>
        
        <div className="glass-panel fade-up" style={{ padding: '2.5rem', animationDelay: '0.1s' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
              <div style={{ padding: '0.6rem', borderRadius: '12px', background: 'rgba(167, 139, 250, 0.1)', color: 'var(--premium)' }}><ShieldCheck size={22} /></div>
              <h3 className="chart-title" style={{ margin: 0 }}>Équilibre Stratégique (Radar)</h3>
           </div>
           <div style={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                 <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.05)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-dim)', fontSize: 11, fontWeight: 700 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                       name="Executive Score"
                       dataKey="A"
                       stroke="var(--premium)"
                       strokeWidth={3}
                       fill="var(--premium)"
                       fillOpacity={0.3}
                    />
                    <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid var(--glass-border)', borderRadius: '12px' }} />
                 </RadarChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="glass-panel fade-up" style={{ padding: '2.5rem', animationDelay: '0.2s' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                 <div style={{ padding: '0.6rem', borderRadius: '12px', background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' }}><Heart size={22} /></div>
                 <h3 className="chart-title" style={{ margin: 0 }}>People Experience & Culture</h3>
              </div>
              <div className="badge" style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899', fontSize: '0.7rem', fontWeight: 900 }}>WELL-BEING MONITOR</div>
           </div>
           
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
              <div>
                 <IndicatorRow label="Indice de Satisfaction" value={stats.satisfactionScore} suffix="/5" color="#ec4899" />
                 <IndicatorRow label="Taux Promotion Interne" value={stats.promotionRate} suffix="%" trend={+2.4} color="#10b981" />
                 <IndicatorRow label="NPS Collaborateurs" value={88} suffix="%" color="var(--accent)" />
              </div>
              <div className="glass-panel-accent" style={{ borderLeftColor: 'var(--premium)', padding: '2rem', background: 'rgba(167, 139, 250, 0.05)' }}>
                 <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 950, marginBottom: '1.5rem', letterSpacing: '0.5px' }}>Diversité & Inclusion</p>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ flex: 1, height: 35, background: 'linear-gradient(90deg, var(--accent), #3b82f6)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 950, boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' }}>M: 62%</div>
                    <div style={{ flex: 0.6, height: 35, background: 'linear-gradient(90deg, var(--premium), #7c3aed)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 950, boxShadow: '0 0 20px rgba(124, 58, 237, 0.3)' }}>F: 38%</div>
                 </div>
                 <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.6, lineHeight: 1.6, fontWeight: 500 }}>
                   La parité progresse de manière organique (+4% de femmes en Production). Engagement RSE élevé.
                 </p>
              </div>
           </div>

           <div style={{ marginTop: '3rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
              {['18-29 ANS', '30-45 ANS', '46-55 ANS', '55+ ANS'].map((age, idx) => (
                 <div key={idx} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 900, opacity: 0.4, marginBottom: '0.8rem', letterSpacing: '1px' }}>{age}</div>
                    <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, border: '1px solid var(--glass-border)' }}>
                       <div style={{ height: '100%', width: `${[25, 45, 20, 10][idx]}%`, background: 'var(--accent)', boxShadow: '0 0 10px rgba(96, 165, 250, 0.3)' }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 950, marginTop: '0.6rem', opacity: 0.8 }}>{[25, 45, 20, 10][idx]}%</div>
                 </div>
              ))}
           </div>
        </div>

      </div>

    </div>
  );
};

export default Page14_StrategicScorecard;
