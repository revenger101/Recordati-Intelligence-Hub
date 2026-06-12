import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, Square, Plus, Trash2, Calendar, AlertCircle, 
  ClipboardList, Target, ChevronRight, Activity, Clock,
  ArrowUpRight, TrendingUp, CheckCircle2, MoreVertical, User
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

const Page12_TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', assigned_to: '', due_date: '', priority: 'Normale' });

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token') || 'bypass';
      const r = await fetch('/api/tasks', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await r.json();
      setTasks(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token') || 'bypass';
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      setShowForm(false);
      setFormData({ title: '', description: '', assigned_to: '', due_date: '', priority: 'Normale' });
      fetchTasks();
    } catch (e) { console.error(e); }
  };

  const toggleTask = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Fait' ? 'A faire' : 'Fait';
    try {
      const token = localStorage.getItem('token') || 'bypass';
      await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchTasks();
    } catch (e) { console.error(e); }
  };

  const deleteTask = async (id) => {
    try {
      const token = localStorage.getItem('token') || 'bypass';
      await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchTasks();
    } catch (e) { console.error(e); }
  };

  const getPriorityColor = (p) => {
    switch(p) {
      case 'Critique': return 'var(--danger)';
      case 'Haute': return 'var(--warning)';
      case 'Basse': return 'var(--success)';
      default: return 'var(--accent)';
    }
  };

  if (loading) return (
    <div style={{ height: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '1.5rem' }}>
       <div className="nexus-glow-orb" style={{ width: 60, height: 60 }}></div>
       <h2 style={{ fontSize: '1.2rem', fontWeight: 900, opacity: 0.5, letterSpacing: '2px' }}>SYNCHRONISATION DES OBJECTIFS...</h2>
    </div>
  );

  return (
    <div className="content-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
       
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 950, letterSpacing: '-1px' }}>Strategic Goal Orchestrator</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.3rem' }}>
               <ClipboardList size={14} color="var(--accent)" />
               <span style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '1px' }}>Pilotage de l'exécution opérationnelle Nexus</span>
            </div>
         </div>
         <button 
           onClick={() => setShowForm(!showForm)} 
           className="premium-btn"
           style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem 1.5rem' }}
         >
            {showForm ? 'Fermer Panel' : <><Plus size={18} /> Activer un Objectif</>}
         </button>
      </div>

      {/* KPI GRID */}
      <div className="stats-grid">
         <MetricCard 
           label="Workload Totale" 
           value={tasks.length} 
           icon={Activity} 
           color="var(--accent)" 
           subtext="Objectifs identifiés"
         />
         <MetricCard 
           label="Réussite Exécution" 
           value={tasks.length > 0 ? ((tasks.filter(t => t.status === 'Fait').length / tasks.length) * 100).toFixed(0) : 0} 
           suffix="%"
           trend={+5.4}
           icon={CheckCircle2} 
           color="var(--success)" 
           subtext="Taux d'achèvement global"
         />
         <MetricCard 
           label="Objectifs Critiques" 
           value={tasks.filter(t => t.priority === 'Critique' && t.status !== 'Fait').length} 
           icon={AlertCircle} 
           color="var(--danger)" 
           subtext="Action immédiate requise"
         />
         <MetricCard 
           label="Performance" 
           value={94} 
           suffix="%"
           icon={TrendingUp} 
           color="var(--premium)" 
           subtext="Indice d'efficacité opérationnelle"
         />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: showForm ? '450px 1fr' : '1fr', gap: '2rem', transition: 'all 0.5s ease' }}>
         {showForm && (
            <div className="glass-panel fade-up" style={{ padding: '2rem', height: 'fit-content', border: '1px solid var(--accent)' }}>
               <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 950 }}>Configuration Stratégique</h3>
                  <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', opacity: 0.5 }}>Paramétrage des indicateurs de réussite</p>
               </div>
               
               <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                     <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, marginBottom: '0.6rem', opacity: 0.6, textTransform: 'uppercase' }}>Titre de l'Objectif</label>
                     <input 
                       type="text" 
                       placeholder="Ex: Optimisation de la MS..." 
                       required 
                       className="premium-input"
                       style={{ width: '100%' }}
                       value={formData.title} 
                       onChange={e => setFormData({...formData, title: e.target.value})} 
                     />
                  </div>

                  <div>
                     <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, marginBottom: '0.6rem', opacity: 0.6, textTransform: 'uppercase' }}>Description Analytique</label>
                     <textarea 
                       placeholder="Détaillez les livrables attendus..." 
                       className="premium-input"
                       style={{ width: '100%', minHeight: '100px', resize: 'none' }}
                       value={formData.description} 
                       onChange={e => setFormData({...formData, description: e.target.value})} 
                     />
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                     <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, marginBottom: '0.6rem', opacity: 0.6, textTransform: 'uppercase' }}>Référent HR</label>
                        <input type="text" placeholder="Assigné à..." className="premium-input" style={{ width: '100%' }} value={formData.assigned_to} onChange={e => setFormData({...formData, assigned_to: e.target.value})} />
                     </div>
                     <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, marginBottom: '0.6rem', opacity: 0.6, textTransform: 'uppercase' }}>Échéance Target</label>
                        <input type="date" required className="premium-input" style={{ width: '100%' }} value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})} />
                     </div>
                  </div>

                  <div>
                     <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, marginBottom: '0.6rem', opacity: 0.6, textTransform: 'uppercase' }}>Indice de Sévérité</label>
                     <select className="premium-input" style={{ width: '100%', background: 'rgba(255,255,255,0.03)', color: 'white' }} value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                        <option value="Basse" style={{color:'#000'}}>Basse</option>
                        <option value="Normale" style={{color:'#000'}}>Normale</option>
                        <option value="Haute" style={{color:'#000'}}>Haute</option>
                        <option value="Critique" style={{color:'#000'}}>Critique</option>
                     </select>
                  </div>
                  
                  <button type="submit" className="premium-btn" style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}>
                     Activer l'Objectif
                  </button>
               </form>
            </div>
         )}

         <div style={{ display: 'grid', gridTemplateColumns: showForm ? '1fr' : '1.5fr 1fr', gap: '2rem' }}>
            <div className="glass-panel fade-up" style={{ animationDelay: '0.2s' }}>
               <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900 }}>Registre d'Exécution Opérationnelle</h3>
                  <div className="badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
                     {tasks.filter(t => t.status === 'Fait').length} Objectifs Atteints
                  </div>
               </div>
               <div style={{ padding: '1.5rem', overflowY: 'auto', maxHeight: 'calc(100vh - 450px)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                     {tasks.map(t => (
                        <div key={t.task_id} className="glass-panel premium-hover" style={{ padding: '1.2rem', display: 'flex', gap: '1.5rem', opacity: t.status === 'Fait' ? 0.6 : 1, transition: 'all 0.3s ease' }}>
                           <button 
                             onClick={() => toggleTask(t.task_id, t.status)} 
                             style={{ background: 'transparent', border: 'none', color: t.status === 'Fait' ? 'var(--success)' : 'rgba(255,255,255,0.1)', cursor: 'pointer', padding: 0 }}
                           >
                              {t.status === 'Fait' ? <CheckSquare size={28} /> : <Square size={28} />}
                           </button>
                           <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                 <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, textDecoration: t.status === 'Fait' ? 'line-through' : 'none' }}>{t.title}</h4>
                                 <span className="badge" style={{ background: `${getPriorityColor(t.priority)}15`, color: getPriorityColor(t.priority), fontSize: '0.6rem' }}>{t.priority.toUpperCase()}</span>
                              </div>
                              <p style={{ margin: '0.5rem 0', fontSize: '0.8rem', opacity: 0.5, lineHeight: 1.5 }}>{t.description}</p>
                              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem' }}>
                                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', fontWeight: 800 }}>
                                    <Calendar size={14} style={{ opacity: 0.3 }} /> {new Date(t.due_date).toLocaleDateString()}
                                 </div>
                                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', fontWeight: 800, opacity: 0.5 }}>
                                    <User size={14} /> {t.assigned_to || 'Non assigné'}
                                 </div>
                              </div>
                           </div>
                           <button onClick={() => deleteTask(t.task_id)} style={{ alignSelf: 'flex-start', background: 'transparent', border: 'none', color: 'var(--danger)', opacity: 0.2, cursor: 'pointer' }}>
                              <Trash2 size={18} />
                           </button>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            {!showForm && (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  <div className="glass-panel fade-up" style={{ padding: '2rem', animationDelay: '0.3s' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900 }}>Vitesse d'Exécution</h3>
                        <Activity size={20} color="var(--accent)" />
                     </div>
                     <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.8rem', marginBottom: '1.5rem' }}>
                        <h2 style={{ margin: 0, fontSize: '3rem', fontWeight: 950 }}>78%</h2>
                        <div style={{ display: 'flex', alignItems: 'center', color: 'var(--success)', fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.8rem' }}>
                           <ArrowUpRight size={16} /> +4.2%
                        </div>
                     </div>
                     <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: '78%', background: 'linear-gradient(90deg, var(--accent), var(--premium))' }} />
                     </div>
                     <p style={{ margin: '1.5rem 0 0', fontSize: '0.75rem', opacity: 0.4, lineHeight: 1.6 }}>Nexus AI analyse une accélération de la vélocité sur les objectifs critiques ITM.</p>
                  </div>

                  <div className="glass-panel fade-up" style={{ padding: '2rem', animationDelay: '0.4s', border: '1px solid rgba(239, 68, 68, 0.1)', background: 'rgba(239, 68, 68, 0.02)' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                        <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', color: 'var(--danger)' }}>
                           <AlertCircle size={28} />
                        </div>
                        <div>
                           <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 950, color: 'var(--danger)' }}>{tasks.filter(t => new Date(t.due_date) < new Date() && t.status !== 'Fait').length} RETARDS DÉTECTÉS</h4>
                           <p style={{ margin: '0.2rem 0 0', fontSize: '0.7rem', opacity: 0.5 }}>Réallocation recommandée pour les objectifs DAF.</p>
                        </div>
                     </div>
                  </div>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default Page12_TaskManager;

