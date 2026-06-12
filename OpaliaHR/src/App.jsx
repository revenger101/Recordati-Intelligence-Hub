import React, { createContext, useContext, useEffect, useState, useMemo, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { 
  Users, Moon, Sun, LogOut, LayoutGrid, Activity, UserMinus, DollarSign, Target, BrainCircuit, FileText, Search, Download, ChevronRight, Building2, Network, Calendar, ClipboardList, TrendingUp, BarChart3, X, Award
} from 'lucide-react';
import './index.css';

// Utility
import html2canvas from 'html2canvas';
import { exportToPDF, exportMasterPDF } from './utils/exportUtils';

// Import Pages
import Page1_CommandCenter from './components/pages/Page1_CommandCenter';
import Page2_Workforce from './components/pages/Page2_Workforce';
import Page3_Turnover from './components/pages/Page3_Turnover';
import Page4_Absenteeism from './components/pages/Page4_Absenteeism';
import Page6_Recruitment from './components/pages/Page6_Recruitment';
import Page7_PredictiveAI from './components/pages/Page7_PredictiveAI';
import Page8_ServiceDetail from './components/pages/Page8_ServiceDetail';
import P9_BasePersonnel from './components/pages/P9_BasePersonnel';

const Page11_LeaveManager = React.lazy(() => import('./components/pages/Page11_LeaveManager'));
const Page12_TaskManager = React.lazy(() => import('./components/pages/Page12_TaskManager'));
import Page13_PowerBI from './components/pages/Page13_PowerBI';
import Page14_StrategicScorecard from './components/pages/Page14_StrategicScorecard';

const AuthContext = createContext({ user: null, logout: () => {} });
import { DataProvider, DataContext } from './context/DataContext';

const useAuth = () => useContext(AuthContext);
const useData = () => useContext(DataContext);



const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({ id: 'ADM-01', name: 'Executive', role: 'admin' });
  const logout = () => { setUser(null); };
  return <AuthContext.Provider value={{ user, logout }}>{children}</AuthContext.Provider>;
};

const RecordatiLogo = ({ height = 32, className = "" }) => {
  return (
    <svg 
      viewBox="0 0 1552 229" 
      height={height} 
      className={className}
      style={{ display: 'block', maxWidth: '100%', height: height }}
    >
      <g>
        {/* Recordati Red icon */}
        <path fill="#d4161a" fillRule="evenodd" d="m223.4 225.4l-223.4-225.4v91l134.1 135z"/>
        <path fill="#d4161a" fillRule="evenodd" d="m111.7 225.4l-111.7-112.7v112.7z"/>
        <path fill="#d4161a" fillRule="evenodd" d="m111.7 0l112.3 113.3-46.5 44-155.8-157.3z"/>
      </g>
      <g fill="currentColor">
        {/* Text letters (RECORDATI) */}
        <path fillRule="evenodd" d="m1552 47v180.2h-29v-180.2z"/>
        <path d="m431.8 226l-59.8-59.7c31.4-1.8 56.8-28.3 56.8-60.2 0-33.2-27.2-60.3-60.4-60.3h-92.4v180.2h29v-85.6l85.7 85.6zm-126.8-88.6v-62.7h63.4c17.5 0 31.4 13.9 31.4 31.4 0 17.4-13.9 31.3-31.4 31.3z"/>
        <path fillRule="evenodd" d="m444.5 227.8h108.1v-28.9h-79.1v-47.6h67.6v-29h-67.6v-47.6h79.1v-28.9h-108.1z"/>
        <path d="m1317.1 45.8l-83.4 180.2h32.1l13.2-28.9h91.8l12.7 28.9h32l-80.9-180.2zm-24.8 122.9l33.3-72.3 32 72.3z"/>
        <path d="m1080.4 226l-59.8-59.7c31.4-1.8 56.7-28.3 56.7-60.2 0-33.2-27.1-60.3-60.3-60.3h-92.4v180.2h28.9v-85.6l85.8 85.6zm-126.8-88.6v-62.7h63.4c17.5 0 31.4 13.9 31.4 31.4 0 17.4-13.9 31.3-31.4 31.3z"/>
        <path d="m816.5 42.8c-51.4 0-93 41.6-93 92.8 0 51.2 41.6 93.4 93 93.4 51.3 0 93-41.6 93-92.8 0-51.2-41.7-93.4-93-93.4zm0 157.3c-35.1 0-64.1-29-64.1-63.9 0-35 29-63.9 64.1-63.9 35 0 64 28.9 64 63.9 0 34.9-28.4 63.9-64 63.9z"/>
        <path d="m651.6 200.1c-34.4 0-62.8-29-62.8-63.9 0-35 28.4-63.9 62.8-63.9 19.9 0 38 9.1 50.1 25.3l23-17.4c-17.5-23.6-44.1-36.8-73.1-36.8-50.7 0-91.8 41.6-91.8 92.8 0 51.2 41.1 92.8 91.8 92.8 29.6 0 57.4-14.5 74.9-39.2l-23.6-16.8c-12 16.8-30.8 27.1-51.3 27.1z"/>
        <path d="m1250.7 136.8c0-50-41.1-91-91.2-91h-64v181.4h64c50.1 0 91.2-40.4 91.2-90.4zm-91.2 61.5h-35.1v-123.6h35.1c34.4 0 62.2 27.7 62.2 62.1 0 33.7-27.8 61.5-62.2 61.5z"/>
        <path fillRule="evenodd" d="m1378.7 75.9h51.9v151.3h29v-151.3h51.3v-28.9h-132.2z"/>
      </g>
    </svg>
  );
};

// --- MAIN APPLICATION ---
const IntelligenceHub = () => {
   const { logout } = useAuth();
   const { employees, totalEmployees, activeEmployees, monthlyStats, isLoading, refresh } = useData();
   const [activeTab, setActiveTab] = useState('p1');
   const [isDarkMode, setIsDarkMode] = useState(true);
   const [isExporting, setIsExporting] = useState(false);
   const [exportSubTab, setExportSubTab] = useState(null);
   
    const [globalFilters, setGlobalFilters] = useState({ 
      dept: 'All', 
      date: monthlyStats.length > 0 ? monthlyStats[monthlyStats.length - 1].label : '', 
      search: '',
      gender: 'All',
      status: 'All',
      risk: 'All',
      seniority: 'All'
    });
    useEffect(() => { 
        if (globalFilters.dept && globalFilters.dept !== 'All' && refresh) {
            refresh(globalFilters.dept); 
        }
    }, [globalFilters.dept]); // Removed refresh from deps to prevent potential loops
    const [lastSync, setLastSync] = useState(null);

    useEffect(() => {
     fetch('/api/etl/status', {
       headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || 'bypass'}` }
     })
     .then(res => res.json())
     .then(data => setLastSync(data.last_sync))
     .catch(err => console.error(err));
    }, []);

    useEffect(() => {
     if (monthlyStats.length > 0 && !globalFilters.date) {
        // Enforce selecting the last month that HAS actual activity (departures or payroll)
        const lastWithData = [...monthlyStats].reverse().find(s => Number(s.departures) > 0 || Number(s.total_salary) > 0);
        const target = lastWithData || monthlyStats[monthlyStats.length - 1];
        setGlobalFilters(prev => ({ ...prev, date: target.label }));
     }
   }, [monthlyStats]);

    useEffect(() => { document.body.className = isDarkMode ? 'dark-mode' : 'light-mode'; }, [isDarkMode]);

    const uniqueDepts = ['All', ...new Set((employees || []).map(e => e.dept || e.departement))].filter(Boolean);

    const filteredEmployees = useMemo(() => {
       return employees.filter(e => {
          const matchDept = globalFilters.dept === 'All' || e.dept === globalFilters.dept;
          const matchSearch = !globalFilters.search || 
             [e.id, e.name, e.role].some(v => String(v).toLowerCase().includes(globalFilters.search.toLowerCase()));
          
          const matchGender = globalFilters.gender === 'All' || (e.gender || e.genre) === globalFilters.gender;
          const matchStatus = globalFilters.status === 'All' || (e.statut || e.status) === globalFilters.status;
          
          let matchRisk = true;
          if (globalFilters.risk === 'Critical') matchRisk = e.risk_score >= 0.7;
          else if (globalFilters.risk === 'High') matchRisk = e.risk_score >= 0.4 && e.risk_score < 0.7;
          else if (globalFilters.risk === 'Moderate') matchRisk = e.risk_score >= 0.2 && e.risk_score < 0.4;
          else if (globalFilters.risk === 'Low') matchRisk = e.risk_score < 0.2;

          let matchSeniority = true;
          if (globalFilters.seniority === '<1 Year') matchSeniority = e.anciennete < 1;
          else if (globalFilters.seniority === '1-5 Years') matchSeniority = e.anciennete >= 1 && e.anciennete < 5;
          else if (globalFilters.seniority === '5-10 Years') matchSeniority = e.anciennete >= 5 && e.anciennete < 10;
          else if (globalFilters.seniority === '10+ Years') matchSeniority = e.anciennete >= 10;

          return matchDept && matchSearch && matchGender && matchStatus && matchRisk && matchSeniority;
       });
    }, [employees, globalFilters]);

   const currentMonthData = useMemo(() => {
     return monthlyStats.find(s => s.label === globalFilters.date) || monthlyStats[monthlyStats.length - 1] || { headcount: employees.length, absence_days: 0 };
   }, [monthlyStats, globalFilters.date, employees]);

   const handleExport = async () => {
      // --- COMPREHENSIVE EXPORT SEQUENCE ---
      const exportSequence = [
         { id: 'p1', label: 'Command Center' },
         { id: 'p2', label: 'Workforce' },
         { id: 'p3', sub: 't1', label: 'Turnover - Overview' },
         { id: 'p3', sub: 't2', label: 'Turnover - Predictive' },
         { id: 'p3', sub: 't3', label: 'Turnover - Drilldown' },
         { id: 'p4', sub: 'a1', label: 'Absenteeism - Overview' },
         { id: 'p4', sub: 'a2', label: 'Absenteeism - MOD/MOI' },
         { id: 'p4', sub: 'a3', label: 'Absenteeism - Overtime' },
         { id: 'p6', label: 'Recrutement' },
         { id: 'p7', label: 'Nexus AI' },
         { id: 'p11', label: 'Leave Manager' },
         { id: 'p12', label: 'Task Manager' }
      ];

      const originalTab = activeTab;
      setIsExporting(true);
      
      const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
      
      try {
         const pdf = new jsPDF('l', 'mm', 'a4');
         const pdfWidth = pdf.internal.pageSize.getWidth();
         const pdfHeight = pdf.internal.pageSize.getHeight();

         document.body.classList.add('printing-mode');
         
         for (let i = 0; i < exportSequence.length; i++) {
            const page = exportSequence[i];
            console.log(`Capturing: ${page.label} [${i + 1}/${exportSequence.length}]`);
            
            setActiveTab(page.id);
            setExportSubTab(page.sub || null);
            
            await sleep(2200); // Robust wait for full render
            
            const element = document.getElementById('dashboard-root');
            if (!element) continue;

            const viewportContent = element.querySelector('.viewport-content');
            
            const originalScrollPos = viewportContent ? viewportContent.scrollTop : 0;
            const originalOverflow = document.body.style.overflow;
            document.body.style.overflow = 'visible';

            if (viewportContent) {
               viewportContent.style.overflow = 'visible';
               viewportContent.style.height = 'auto';
               viewportContent.style.maxHeight = 'none';
            }

            const canvas = await html2canvas(element, {
               scale: 3, 
               backgroundColor: isDarkMode ? '#030711' : '#f8fafc',
               useCORS: true,
               allowTaint: false,
               logging: false,
               width: 1280,
               windowWidth: 1280,
               scrollX: 0,
               scrollY: 0,
               ignoreElements: (el) => 
                  el.classList.contains('header-actions') || 
                  el.classList.contains('sidebar-glass') || 
                  el.classList.contains('viewport-header')
            });

            document.body.style.overflow = originalOverflow;
            if (viewportContent) {
               viewportContent.style.overflow = 'auto';
               viewportContent.style.height = '';
               viewportContent.style.maxHeight = '';
               viewportContent.scrollTop = originalScrollPos;
            }

            const imgData = canvas.toDataURL('image/png', 1.0);
            if (i > 0) pdf.addPage('l', 'mm', 'a4');

            const imgWidth = pdfWidth - 20; 
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, Math.min(imgHeight, pdfHeight - 20));
            
            pdf.setFontSize(7);
            pdf.setTextColor(120);
            pdf.text(`RECORDATI HR INTELLIGENCE HUB — EXECUTIVE REPORT — ${page.label} — PAGE ${i + 1}/${exportSequence.length}`, pdfWidth / 2, pdfHeight - 4, { align: 'center' });
         }
         pdf.save(`RecordatiHR_Full_Executive_Dossier_${globalFilters.date.replace(' ', '_')}.pdf`);
      } catch (err) {
         console.error('CRITICAL EXPORT FAILURE:', err);
         alert('Erreur lors de l\'exportation.');
      } finally {
         document.body.classList.remove('printing-mode');
         setActiveTab(originalTab);
         setIsExporting(false);
      }
   };

   const sidebarNav = [
      { type: 'section', label: 'PILOTAGE' },
      { id: 'p1', label: 'Command Center', icon: LayoutGrid },
      { id: 'p2', label: 'Effectifs & Workforce', icon: Users },
      { id: 'p3', label: 'Turnover & Attrition', icon: UserMinus },
      { type: 'section', label: 'OPÉRATIONS' },
      { id: 'p4', label: 'Absentéisme & Dispo', icon: Activity },
      { id: 'p6', label: 'Recrutement & Flux', icon: TrendingUp },
      { type: 'section', label: 'STRATÉGIE' },
      { id: 'p14', label: 'Scorecard Stratégique', icon: Award },
      { id: 'p7', label: 'Predictive AI (Nexus)', icon: BrainCircuit },
      { type: 'section', label: 'ADMIN' },
      { id: 'p9', label: 'Gestion des Employés', icon: Users },
      { id: 'p11', label: 'Gestion des Congés', icon: Calendar },
      { id: 'p12', label: 'Tâches & Objectifs', icon: ClipboardList },
      { type: 'section', label: 'SYSTÈME' },
      { id: 'p13', label: 'Power BI Hub', icon: BarChart3 }
    ];

   const renderContent = () => {
      if (isLoading) return <div className="loading-state"><div className="logo-box pulse"><Network size={32} color="white"/></div><h2>Synchronizing Intelligence...</h2></div>;
      
      const props = { 
        employees: filteredEmployees, 
        totalEmployees,
        activeEmployees,
        selectedMonth: currentMonthData, 
        allHistory: monthlyStats 
      };

      switch(activeTab) {
         case 'p1': return <Page1_CommandCenter {...props} />;
         case 'p2': return <Page2_Workforce {...props} />;
         case 'p3': return <Page3_Turnover {...props} activeSubTabExport={exportSubTab} />;
         case 'p4': return <Page4_Absenteeism {...props} activeSubTabExport={exportSubTab} />;
         case 'p6': return <Page6_Recruitment />;
         case 'p7': return <Page7_PredictiveAI employees={employees} />;
         case 'p13': return <Page13_PowerBI />;
         case 'p14': return <Page14_StrategicScorecard {...props} />;
         case 'p8': return <Page8_ServiceDetail employees={employees} onBack={() => setActiveTab('p1')} />;
         case 'p9': return <P9_BasePersonnel data={employees} />;

         case 'p11': return <Page11_LeaveManager employees={employees} />;
         case 'p12': return <Page12_TaskManager />;
         default: return <Page1_CommandCenter {...props} />;
      }
   };

   return (
      <div className="app-canvas">
         <aside className="sidebar-glass">
            <div className="sidebar-logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '2rem 1.8rem 2.2rem', gap: '0.4rem' }}>
               <RecordatiLogo height={26} />
               <span style={{ 
                  fontSize: '0.62rem', 
                  fontWeight: 800, 
                  letterSpacing: '3px', 
                  color: 'var(--accent)', 
                  textTransform: 'uppercase',
                  paddingLeft: '30px',
                  opacity: 0.95
               }}>
                  Intelligence Hub
               </span>
            </div>
            
            <div className="sidebar-nav">
               {sidebarNav.map((n, i) => n.type === 'section' ? (
                  <div key={`s-${i}`} className="nav-section">{n.label}</div>
               ) : (
                  <button key={n.id} onClick={()=>setActiveTab(n.id)} className={`nav-link ${activeTab === n.id ? 'active' : ''}`}>
                     <n.icon size={18}/> {n.label}
                  </button>
               ))}
            </div>

            <div className="sidebar-footer">
               <div className="user-profile">
                  <div className="avatar">AD</div>
                  <div className="user-info">
                     <div className="user-name">Executive Admin</div>
                     <div className="user-role">Power BI Mode</div>
                  </div>
                  <button className="logout-btn" onClick={logout}><LogOut size={16}/></button>
               </div>
            </div>
         </aside>

         <main className="content-viewport" id="dashboard-root">
            <header className="viewport-header">
                <div>
                   <h1 className="page-title">{sidebarNav.find(n => n.id === activeTab)?.label}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                       <div className="last-sync" style={{ fontSize: '0.7rem', opacity: 0.6 }}>
                          Dernière synchronisation: {lastSync ? new Date(lastSync).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'En attente...'}
                       </div>
                       {employees.length > 0 && employees[0].id === 'MAT-1000' ? (
                          <span className="badge" style={{ background: 'rgba(255,149,0,0.1)', color: 'var(--warning)', fontSize: '0.6rem', padding: '2px 8px', borderRadius: '4px' }}>SIMULATION MODE (OFFLINE)</span>
                       ) : (
                          <span className="badge" style={{ background: 'rgba(52,199,89,0.1)', color: 'var(--success)', fontSize: '0.6rem', padding: '2px 8px', borderRadius: '4px' }}>NEXUS AI SYNC (REAL-TIME DATA)</span>
                       )}
                    </div>
                </div>

               <div className="header-actions">
                  <button className="premium-btn" onClick={handleExport} disabled={isExporting} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem' }}>
                     <FileText size={14}/> {isExporting ? 'Generating Report...' : 'Export Report'}
                  </button>
                  <div className="search-box">
                     <Search size={14} opacity={0.4}/>
                     <input 
                        type="text" 
                        placeholder="Search Talent..." 
                        value={globalFilters.search} 
                        onChange={e => setGlobalFilters({...globalFilters, search: e.target.value})}
                     />
                  </div>
                  <button 
                    className={`icon-btn ${activeTab === 'filters' ? 'active' : ''}`} 
                    onClick={() => setGlobalFilters(prev => ({ ...prev, showAdvanced: !prev.showAdvanced }))}
                    style={{ background: globalFilters.showAdvanced ? 'var(--accent)' : 'rgba(255,255,255,0.05)' }}
                  >
                     <BarChart3 size={18}/>
                  </button>
                  <button className="icon-btn" onClick={()=>setIsDarkMode(!isDarkMode)}>
                     {isDarkMode ? <Sun size={18}/> : <Moon size={18}/>}
                  </button>
               </div>
            </header>

            {globalFilters.showAdvanced && (
               <div className="glass-panel fade-down" style={{ margin: '0 2rem 2rem', padding: '1.5rem', border: '1px solid var(--accent)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                      <div className="filter-group-premium">
                         <Calendar size={12} className="filter-icon" />
                         <span className="filter-label">Période:</span>
                         <select value={globalFilters.date} onChange={e => setGlobalFilters({...globalFilters, date: e.target.value})}>
                            {monthlyStats.map(s => <option key={s.label} value={s.label}>{s.label}</option>)}
                         </select>
                      </div>

                      <div className="filter-group-premium">
                         <Building2 size={12} className="filter-icon" />
                         <span className="filter-label">Service:</span>
                         <select value={globalFilters.dept} onChange={e => setGlobalFilters({...globalFilters, dept: e.target.value})}>
                            {uniqueDepts.map(d => <option key={d} value={d}>{d}</option>)}
                         </select>
                      </div>

                      <div className="filter-group-premium">
                         <Users size={12} className="filter-icon" />
                         <span className="filter-label">Genre:</span>
                         <select value={globalFilters.gender} onChange={e => setGlobalFilters({...globalFilters, gender: e.target.value})}>
                            <option value="All">Tous</option>
                            <option value="M">Masc.</option>
                            <option value="F">Fém.</option>
                         </select>
                      </div>

                      <div className="filter-group-premium">
                         <Activity size={12} className="filter-icon" />
                         <span className="filter-label">Statut:</span>
                         <select value={globalFilters.status} onChange={e => setGlobalFilters({...globalFilters, status: e.target.value})}>
                            <option value="All">Tous</option>
                            <option value="Actif">Actif</option>
                            <option value="SORTANT">Sortant</option>
                            <option value="Congé">Congé</option>
                         </select>
                      </div>

                      <div className="filter-group-premium">
                         <BrainCircuit size={12} className="filter-icon" />
                         <span className="filter-label">Risque:</span>
                         <select value={globalFilters.risk} onChange={e => setGlobalFilters({...globalFilters, risk: e.target.value})}>
                            <option value="All">Tous</option>
                            <option value="Critical">Critique</option>
                            <option value="High">Haut</option>
                            <option value="Moderate">Modéré</option>
                            <option value="Low">Faible</option>
                         </select>
                      </div>

                      <div className="filter-group-premium">
                         <TrendingUp size={12} className="filter-icon" />
                         <span className="filter-label">Exp:</span>
                         <select value={globalFilters.seniority} onChange={e => setGlobalFilters({...globalFilters, seniority: e.target.value})}>
                            <option value="All">Toutes</option>
                            <option value="<1 Year">&lt; 1 an</option>
                            <option value="1-5 Years">1-5 ans</option>
                            <option value="5-10 Years">5-10 ans</option>
                            <option value="10+ Years">10+ ans</option>
                         </select>
                      </div>
                      
                      <button 
                         onClick={() => setGlobalFilters({ ...globalFilters, dept: 'All', gender: 'All', status: 'All', risk: 'All', seniority: 'All', search: '' })}
                         className="premium-btn"
                         style={{ background: 'rgba(255,255,255,0.05)', fontSize: '0.7rem' }}
                      >
                         Reset Filters
                      </button>
                  </div>
               </div>
            )}

            <div className="filter-summary-bar">
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <span className="results-count"><strong>{filteredEmployees.length}</strong> Résultats trouvés</span>
                  <div className="divider-v"></div>
                  <div className="active-pills">
                     {globalFilters.dept !== 'All' && <span className="filter-pill" onClick={() => setGlobalFilters({...globalFilters, dept: 'All'})}>Service: {globalFilters.dept} <X size={10} style={{marginLeft: 4, cursor: 'pointer'}}/></span>}
                     {globalFilters.gender !== 'All' && <span className="filter-pill" onClick={() => setGlobalFilters({...globalFilters, gender: 'All'})}>Genre: {globalFilters.gender === 'M' ? 'Masculin' : 'Féminin'} <X size={10} style={{marginLeft: 4, cursor: 'pointer'}}/></span>}
                     {globalFilters.status !== 'All' && <span className="filter-pill" onClick={() => setGlobalFilters({...globalFilters, status: 'All'})}>Status: {globalFilters.status} <X size={10} style={{marginLeft: 4, cursor: 'pointer'}}/></span>}
                     {globalFilters.risk !== 'All' && <span className="filter-pill" onClick={() => setGlobalFilters({...globalFilters, risk: 'All'})}>Risque: {globalFilters.risk} <X size={10} style={{marginLeft: 4, cursor: 'pointer'}}/></span>}
                     {globalFilters.seniority !== 'All' && <span className="filter-pill" onClick={() => setGlobalFilters({...globalFilters, seniority: 'All'})}>Ancienneté: {globalFilters.seniority} <X size={10} style={{marginLeft: 4, cursor: 'pointer'}}/></span>}
                     {globalFilters.search && <span className="filter-pill" onClick={() => setGlobalFilters({...globalFilters, search: ''})}>Recherche: "{globalFilters.search}" <X size={10} style={{marginLeft: 4, cursor: 'pointer'}}/></span>}
                  </div>
               </div>
               <div className="month-badge">{globalFilters.date}</div>
            </div>

            <div className="viewport-content">
               <Suspense fallback={<div className="loading-state"><h2>Loading Nexus Hub...</h2></div>}>
                  {renderContent()}
               </Suspense>
 
             </div>
         </main>
      </div>
   );
};

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <IntelligenceHub />
      </DataProvider>
    </AuthProvider>
  );
}
