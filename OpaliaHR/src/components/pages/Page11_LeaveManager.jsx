import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, CheckCircle, Clock, XCircle, Plus, Filter, User, 
  ChevronRight, Briefcase, MapPin, ArrowUpRight, TrendingUp, AlertCircle, Trash2, Activity
} from 'lucide-react';

const MetricCard = ({ label, value, trend, icon: Icon, color = 'var(--accent)', suffix = '', subtext }) => (
  <div className="glass-panel mini-card premium-hover fade-up">
    <div className="metric-header">
      <div className="metric-icon-box" style={{ color }}>
        <Icon size={22} />
      </div>
      {trend && (
        <div className={`trend-indicator ${trend > 0 ? 'up' : 'down'}`}>
          {trend > 0 ? <ArrowUpRight size={12} /> : <TrendingUp size={12} style={{transform: 'rotate(180deg)'}} />}
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

const Page11_LeaveManager = ({ employees = [] }) => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [formData, setFormData] = useState({ employee_id: '', type: 'Congé annuel', start_date: '', end_date: '' });

  const fetchLeaves = async () => {
    try {
      const token = localStorage.getItem('token') || 'bypass';
      const r = await fetch('/api/leaves', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await r.json();
      setLeaves(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLeaves(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token') || 'bypass';
      await fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      setShowRequestForm(false);
      fetchLeaves();
    } catch (e) { console.error(e); }
  };

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token') || 'bypass';
      await fetch(`/api/leaves/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchLeaves();
    } catch (e) { console.error(e); }
  };

  if (loading) return (
    <div style={{ height: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '1.5rem' }}>
       <div className="nexus-glow-orb" style={{ width: 60, height: 60 }}></div>
       <h2 style={{ fontSize: '1.2rem', fontWeight: 900, opacity: 0.5, letterSpacing: '2px' }}>SYNCHRONISATION DU WORKFLOW...</h2>
    </div>
  );

  return (
    <div className="content-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 950, letterSpacing: '-1px' }}>Workforce Absence Management</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.3rem' }}>
               <Calendar size={14} color="var(--accent)" />
               <span style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '1px' }}>Pilotage des flux d'absences en temps réel</span>
            </div>
         </div>
         <button 
           onClick={() => setShowRequestForm(!showRequestForm)} 
           className="premium-btn"
           style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem 1.5rem' }}
         >
            {showRequestForm ? 'Fermer Panel' : <><Plus size={18} /> Nouvelle Demande</>}
         </button>
      </div>

      {/* KPI GRID */}
      <div className="stats-grid">
         <MetricCard 
           label="Files d'Attente" 
           value={leaves.filter(l => l.status === 'En attente').length} 
           icon={AlertCircle} 
           color="var(--warning)" 
           subtext="Action managériale requise"
         />
         <MetricCard 
           label="Congés Validés" 
           value={leaves.filter(l => l.status === 'Approuvé').length} 
           icon={CheckCircle} 
           color="var(--success)" 
           subtext="Validations sur période active"
         />
         <MetricCard 
           label="Disponibilité" 
           value={employees && employees.length > 0 ? (((employees.length - leaves.filter(l => l.status === 'Approuvé').length) / employees.length) * 100).toFixed(1) : 0} 
           suffix="%"
           icon={Activity} 
           color="var(--accent)" 
           subtext="Force opérationnelle actuelle"
         />
         <MetricCard 
           label="Alertes Nexus" 
           value={4} 
           icon={TrendingUp} 
           color="var(--premium)" 
           subtext="Risques de sous-effectif identifiés"
         />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: showRequestForm ? '400px 1fr' : '1fr', gap: '2rem', transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}>
         {showRequestForm && (
            <div className="glass-panel fade-up" style={{ padding: '2rem', height: 'fit-content', border: '1px solid var(--accent)' }}>
               <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 950 }}>Configuration Requête</h3>
                  <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', opacity: 0.5 }}>Initialisation d'un nouveau flux de dispense</p>
               </div>
               
               <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                     <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, marginBottom: '0.6rem', opacity: 0.6, textTransform: 'uppercase' }}>Collaborateur</label>
                     <select 
                       required 
                       className="premium-input"
                       style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.03)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '12px', outline: 'none' }}
                       value={formData.employee_id} 
                       onChange={e => setFormData({...formData, employee_id: e.target.value})}
                     >
                        <option value="" style={{color: '#000'}}>Sélectionner...</option>
                        {employees.map(e => <option key={e.id} value={e.id} style={{color: '#000'}}>{e.name} ({e.id})</option>)}
                     </select>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                     <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, marginBottom: '0.6rem', opacity: 0.6, textTransform: 'uppercase' }}>Début</label>
                        <input type="date" required className="premium-input" style={{ width: '100%' }} value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} />
                     </div>
                     <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, marginBottom: '0.6rem', opacity: 0.6, textTransform: 'uppercase' }}>Fin</label>
                        <input type="date" required className="premium-input" style={{ width: '100%' }} value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} />
                     </div>
                  </div>

                  <div>
                     <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, marginBottom: '1rem', opacity: 0.6, textTransform: 'uppercase' }}>Nature du Congé</label>
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                        {['Congé annuel', 'Maladie', 'Formation', 'Sans solde'].map(t => (
                          <button 
                            key={t} 
                            type="button" 
                            onClick={() => setFormData({...formData, type: t})} 
                            style={{ 
                              padding: '0.8rem', 
                              fontSize: '0.75rem', 
                              borderRadius: '10px', 
                              border: '1px solid var(--glass-border)', 
                              background: formData.type === t ? 'var(--accent)' : 'rgba(255,255,255,0.02)', 
                              color: 'white', 
                              cursor: 'pointer',
                              fontWeight: 700,
                              transition: 'all 0.2s ease'
                            }}
                          >
                             {t}
                          </button>
                        ))}
                     </div>
                  </div>
                  
                  <button type="submit" className="premium-btn" style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}>
                     Valider & Soumettre
                  </button>
               </form>
            </div>
         )}

         <div className="glass-panel fade-up" style={{ animationDelay: '0.2s', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900 }}>File d'Approbation Stratégique</h3>
               <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="icon-btn"><Filter size={16} /></button>
               </div>
            </div>
            <div style={{ padding: '1rem', overflowY: 'auto', maxHeight: 'calc(100vh - 400px)' }}>
               <table className="executive-table">
                  <thead>
                     <tr>
                        <th>Collaborateur</th>
                        <th>Période & Durée</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Actions Décisionnelles</th>
                     </tr>
                  </thead>
                  <tbody>
                    {leaves.map((l) => (
                      <tr key={l.leave_id} className="premium-hover">
                        <td>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <div className="avatar" style={{ width: 36, height: 36 }}>{(l.nom || l.name || '?')[0]}</div>
                              <div>
                                 <div style={{ fontWeight: 800 }}>{l.nom} {l.prenom}</div>
                                 <div style={{ fontSize: '0.65rem', opacity: 0.4 }}>{l.type} • #{l.employee_id}</div>
                              </div>
                           </div>
                        </td>
                        <td>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                              <div style={{ width: 28, height: 28, borderRadius: '8px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                 <Clock size={14} opacity={0.4} />
                              </div>
                              <div>
                                 <div style={{ fontWeight: 800, fontSize: '0.8rem' }}>
                                    {l.start_date ? new Date(l.start_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '...'} — {l.end_date ? new Date(l.end_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '...'}
                                 </div>
                                 <div style={{ fontSize: '0.65rem', opacity: 0.4 }}>{Math.ceil((new Date(l.end_date) - new Date(l.start_date)) / (1000 * 60 * 60 * 24)) + 1} jours calendaires</div>
                              </div>
                           </div>
                        </td>
                        <td>
                           <span className="badge" style={{ 
                             background: l.status === 'Approuvé' ? 'rgba(16, 185, 129, 0.1)' : l.status === 'Rejeté' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)', 
                             color: l.status === 'Approuvé' ? 'var(--success)' : l.status === 'Rejeté' ? 'var(--danger)' : 'var(--warning)' 
                           }}>
                              {l.status}
                           </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                           {l.status === 'En attente' ? (
                             <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
                                <button onClick={() => updateStatus(l.leave_id, 'Approuvé')} className="premium-btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem' }}>Approuver</button>
                                <button onClick={() => updateStatus(l.leave_id, 'Rejeté')} className="premium-btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem', color: 'var(--danger)' }}>Rejeter</button>
                             </div>
                           ) : (
                             <div style={{ opacity: 0.3, display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                <span style={{ fontSize: '0.6rem', fontWeight: 900 }}>ARCHIVÉ</span>
                                <ChevronRight size={14} />
                             </div>
                           )}
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

export default Page11_LeaveManager;
