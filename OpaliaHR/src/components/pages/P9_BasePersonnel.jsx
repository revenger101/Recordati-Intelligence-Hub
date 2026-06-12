import React, { useState, useEffect, useContext } from 'react';
import { 
  Users, UserPlus, CheckCircle2, Calendar, FileText, 
  Search, Filter, MoreVertical, Edit3, Trash2, Download, Plus
} from 'lucide-react';
import { DataContext } from '../../context/DataContext';
import { exportToPDF } from '../../utils/exportUtils';

const InputField = ({ label, field, type="text", formData, setFormData }) => (
  <div style={{ marginBottom: '1.2rem' }}>
    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.6rem', opacity: 0.6, textTransform: 'uppercase' }}>{label}</label>
    <input 
      type={type} 
      value={formData[field]||''} 
      onChange={e=>setFormData({...formData, [field]: e.target.value})} 
      className="premium-input"
      style={{ 
        width: '100%', 
        padding: '0.8rem 1rem', 
        borderRadius: '12px', 
        border: '1px solid var(--glass-border)', 
        background: 'rgba(255,255,255,0.03)', 
        color: 'var(--text-main)', 
        outline: 'none',
        fontSize: '0.9rem'
      }} 
    />
  </div>
);

const P9_BasePersonnel = ({ data }) => {
   const { refresh } = useContext(DataContext);
   const [employees, setEmployees] = useState(data);
   const [modal, setModal] = useState({ isOpen: false, type: '', data: null });
   const [formData, setFormData] = useState({});
   const [searchTerm, setSearchTerm] = useState('');

   useEffect(() => { setEmployees(data); }, [data]);

   const openModal = (type, d = null) => { setModal({ isOpen: true, type, data: d }); setFormData(d ? { ...d } : {}); };
   const closeModal = () => { setModal({ isOpen: false, type: '', data: null }); setFormData({}); };

   const handleSave = async () => {
      const token = localStorage.getItem('token') || 'bypass';
      try {
         if (modal.type === 'add_emp') {
            await fetch('/api/employees', {
               method: 'POST',
               headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
               },
               body: JSON.stringify({
                  name: formData.name,
                  dept: formData.dept,
                  role: formData.role,
                  salary: Number(formData.salary),
                  age: 30,
                  gender: 'Masculin'
               })
            });
         } else if (modal.type === 'edit_emp') {
            await fetch(`/api/employees/${modal.data.id}`, {
               method: 'PUT',
               headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
               },
               body: JSON.stringify({
                  name: formData.name,
                  dept: formData.dept,
                  role: formData.role,
                  salary: Number(formData.salary)
               })
            });
         }
         refresh();
      } catch (err) {
         console.error('Error saving employee:', err);
      }
      closeModal();
   };

   const handleDelete = async (empId) => {
      if (!window.confirm('Voulez-vous vraiment enregistrer le départ de ce collaborateur ?')) return;
      const token = localStorage.getItem('token') || 'bypass';
      try {
         await fetch(`/api/employees/${empId}`, {
            method: 'DELETE',
            headers: {
               'Authorization': `Bearer ${token}`
            }
         });
         refresh();
      } catch (err) {
         console.error('Error deleting employee:', err);
      }
   };

   const handleExportXLSX = () => {
      const headers = ['Matricule', 'Nom Complet', 'Direction', 'Poste', 'Salaire (TND)', 'Risque Attrition', 'Statut'];
      const rows = filteredEmployees.map(e => [
         e.id,
         e.name || 'Anonyme',
         e.dept || 'NC',
         e.role || 'Staff',
         e.salary || 0,
         `${((Number(e.risk_score) || 0) * 100).toFixed(0)}%`,
         e.statut || 'Actif'
      ]);

      const csvContent = "\uFEFF" + [
         headers.join(';'),
         ...rows.map(r => r.map(val => {
            let str = String(val);
            if (str.includes(';') || str.includes('\n') || str.includes('"')) {
               str = '"' + str.replace(/"/g, '""') + '"';
            }
            return str;
         }).join(';'))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `OpaliaHR_Personnel_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
   };

   const filteredEmployees = employees.filter(e => 
      [e.id, e.name, e.dept, e.role].some(v => String(v || '').toLowerCase().includes(searchTerm.toLowerCase()))
   );

   return (
       <div className="content-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* MODAL OVERLAY */}
          {modal.isOpen && (
             <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div className="glass-panel fade-up" style={{ width: '450px', padding: '2.5rem', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
                   <div style={{ marginBottom: '2rem' }}>
                      <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 950 }}>{modal.type === 'add_emp' ? 'Nouveau Collaborateur' : 'Détails Profil'}</h2>
                      <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', opacity: 0.5 }}>Gestion des données structurelles OpaliaHR</p>
                   </div>
                   
                   <InputField label="Nom Complet" field="name" formData={formData} setFormData={setFormData} />
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      <InputField label="Direction" field="dept" formData={formData} setFormData={setFormData} />
                      <InputField label="Fonction" field="role" formData={formData} setFormData={setFormData} />
                   </div>
                   <InputField label="Rémunération Mensuelle (TND)" field="salary" type="number" formData={formData} setFormData={setFormData} />
                   
                   <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                      <button onClick={closeModal} className="premium-btn-outline" style={{ flex: 1 }}>Annuler</button>
                      <button onClick={handleSave} className="premium-btn" style={{ flex: 1 }}>Confirmer</button>
                   </div>
                </div>
             </div>
          )}

          {/* ACTION BAR */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '1.2rem', opacity: 0.4 }} />
                <input 
                  type="text" 
                  placeholder="Rechercher par matricule, nom, direction..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="premium-input"
                  style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 3rem', borderRadius: '14px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.03)', color: 'white', outline: 'none' }}
                />
             </div>
             <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="premium-btn-outline" onClick={handleExportXLSX}>
                   <Download size={16} style={{ marginRight: '0.6rem' }} /> Export Excel
                </button>
                <button className="premium-btn" onClick={()=>openModal('add_emp')}>
                   <Plus size={16} style={{ marginRight: '0.6rem' }} /> Recruter
                </button>
             </div>
          </div>

          {/* MAIN DIRECTORY TABLE */}
          <div className="glass-panel fade-up" style={{ animationDelay: '0.1s' }}>
             <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900 }}>Annuaire Stratégique du Personnel</h3>
                <div style={{ fontSize: '0.75rem', opacity: 0.5, fontWeight: 700 }}>{filteredEmployees.length} Collaborateurs Identifiés</div>
             </div>
             <div style={{ padding: '1rem' }} id="personnel-table">
                <table className="executive-table">
                   <thead>
                      <tr>
                        <th>Collaborateur</th>
                        <th>Direction</th>
                        <th>Poste</th>
                        <th>Risque Attrition</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                   </thead>
                   <tbody>
                      {filteredEmployees.map(e => (
                        <tr key={e.id}>
                           <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                 <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.8rem' }}>{(e.name || '??').substring(0,2)}</div>
                                 <div>
                                    <div style={{ fontWeight: 800 }}>{e.name || 'Anonyme'}</div>
                                    <div style={{ fontSize: '0.65rem', opacity: 0.4 }}>{e.id}</div>
                                 </div>
                              </div>
                           </td>
                           <td style={{ fontSize: '0.8rem', fontWeight: 600 }}>{e.dept}</td>
                           <td style={{ fontSize: '0.8rem', opacity: 0.7 }}>{e.role}</td>
                           <td>
                              {(() => {
                                 const rawScore = Number(e.risk_score) || 0;
                                 const score = rawScore <= 1 ? rawScore * 100 : rawScore;
                                 return (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                       <div style={{ flex: 1, width: '60px', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                                          <div style={{ width: `${Math.min(score, 100)}%`, height: '100%', background: score > 70 ? 'var(--danger)' : 'var(--accent)', borderRadius: '2px' }} />
                                       </div>
                                       <span style={{ fontSize: '0.7rem', fontWeight: 800 }}>{score.toFixed(0)}%</span>
                                    </div>
                                 );
                              })()}
                           </td>
                           <td style={{ textAlign: 'right' }}>
                               <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                  <button className="icon-btn" onClick={()=>openModal('edit_emp', e)} style={{ color: 'var(--accent)' }} title="Modifier">
                                     <Edit3 size={16} />
                                  </button>
                                  {e.statut !== 'Sortant' && (
                                     <button className="icon-btn" onClick={()=>handleDelete(e.id)} style={{ color: 'var(--danger)' }} title="Départ">
                                        <Trash2 size={16} />
                                     </button>
                                  )}
                               </div>
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

export default P9_BasePersonnel;

