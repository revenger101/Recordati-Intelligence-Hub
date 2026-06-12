import React, { useState, useEffect, useCallback } from 'react';
import {
  ExternalLink, Database, RefreshCw, BarChart3,
  ShieldCheck, Zap, Network, AlertTriangle, CheckCircle2,
  Clock, Table2, Users, Activity, TrendingDown, Briefcase,
  CalendarDays, BrainCircuit, Timer, Play, Trash2
} from 'lucide-react';

const TABLE_META = [
  { key: 'employees',   label: 'Dim_Employee',           icon: Users,        endpoint: '/api/powerbi/dataset/employees'   },
  { key: 'absences',    label: 'Fact_Absence',           icon: Activity,     endpoint: '/api/powerbi/dataset/absences'    },
  { key: 'turnover',    label: 'Fact_Turnover',          icon: TrendingDown, endpoint: '/api/powerbi/dataset/turnover'    },
  { key: 'snapshots',   label: 'Fact_Employee_Snapshot', icon: Table2,       endpoint: '/api/powerbi/dataset/snapshots'   },
  { key: 'recruitment', label: 'Fact_Recruitment',       icon: Briefcase,    endpoint: '/api/powerbi/dataset/recruitment' },
  { key: 'departments', label: 'Dim_Department',         icon: Database,     endpoint: '/api/powerbi/dataset/departments' },
  { key: 'positions',   label: 'Dim_Position',           icon: Database,     endpoint: '/api/powerbi/dataset/positions'   },
  { key: 'dates',       label: 'Dim_Date',               icon: CalendarDays, endpoint: '/api/powerbi/dataset/dates'       },
  { key: 'predictions', label: 'predictions_log',        icon: BrainCircuit, endpoint: '/api/powerbi/dataset/predictions' },
];

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

const StatusBadge = ({ status }) => {
  const map = {
    success: { color: 'var(--success)', bg: 'rgba(52,199,89,0.1)',  label: 'SYNC OK',    Icon: CheckCircle2 },
    error:   { color: 'var(--danger)',  bg: 'rgba(239,68,68,0.1)',  label: 'ETL FAILED', Icon: AlertTriangle },
    pending: { color: 'var(--warning)', bg: 'rgba(245,158,11,0.1)', label: 'EN ATTENTE', Icon: Clock },
    unknown: { color: 'var(--warning)', bg: 'rgba(245,158,11,0.1)', label: 'INCONNU',    Icon: Clock },
  };
  const cfg = map[status] || map.unknown;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem', borderRadius: '8px', background: cfg.bg, color: cfg.color, fontSize: '0.7rem', fontWeight: 900 }}>
      <cfg.Icon size={13} /> {cfg.label}
    </div>
  );
};

const Page13_PowerBI = () => {
  const [status,   setStatus]   = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [opening,  setOpening]  = useState(false);
  const [copied,   setCopied]   = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [schedOp,  setSchedOp]  = useState(null); // 'register'|'unregister'|'run-now'

  const authHeader = { Authorization: `Bearer ${localStorage.getItem('token') || 'bypass'}` };

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/powerbi/status', { headers: authHeader });
      if (res.ok) setStatus(await res.json());
    } catch {
      // server unreachable — leave status null
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSchedule = useCallback(async () => {
    try {
      const res = await fetch('/api/powerbi/schedule/status', { headers: authHeader });
      if (res.ok) setSchedule(await res.json());
    } catch { /* non-fatal */ }
  }, []);

  useEffect(() => { fetchStatus(); fetchSchedule(); }, [fetchStatus, fetchSchedule]);

  const handleScheduleAction = async (action) => {
    setSchedOp(action);
    try {
      const res = await fetch('/api/powerbi/schedule', {
        method: 'POST',
        headers: { ...authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) alert('Scheduler Error: ' + (data.error || res.statusText));
      else await fetchSchedule();
    } catch (e) {
      alert('Connexion Failure: ' + e.message);
    } finally {
      setSchedOp(null);
    }
  };

  const handleOpen = async () => {
    setOpening(true);
    try {
      const res = await fetch('/api/powerbi/open', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || 'bypass'}` }
      });
      const data = await res.json();
      if (!data.success) alert('Nexus Error: ' + data.message);
    } catch (e) {
      alert('Connexion Failure: ' + e.message);
    } finally {
      setOpening(false);
    }
  };

  const copyEndpoint = (endpoint) => {
    const url = `http://localhost:3000${endpoint}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(endpoint);
      setTimeout(() => setCopied(null), 1800);
    });
  };

  return (
    <div className="content-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* HEADER */}
      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid #f2c811', background: 'linear-gradient(90deg, rgba(242,200,17,0.05) 0%, transparent 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div className="nexus-glow-orb" style={{ width: 56, height: 56, background: 'rgba(242,200,17,0.08)', border: '1px solid rgba(242,200,17,0.2)' }}>
            <BarChart3 size={26} color="#f2c811" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.7rem', fontWeight: 950, letterSpacing: '-0.8px' }}>Power BI Intelligence Bridge</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '0.4rem' }}>
              {loading
                ? <span style={{ fontSize: '0.72rem', opacity: 0.4, fontWeight: 700 }}>Chargement du statut…</span>
                : <StatusBadge status={status?.status || 'unknown'} />
              }
              <span style={{ fontSize: '0.72rem', opacity: 0.45, fontWeight: 700 }}>
                Web Connector → localhost:3000
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            className="premium-btn"
            style={{ padding: '0.75rem 1.2rem', background: 'rgba(255,255,255,0.04)', color: 'var(--text)', fontSize: '0.8rem', fontWeight: 800 }}
            onClick={fetchStatus}
            disabled={loading}
          >
            <RefreshCw size={15} style={{ marginRight: '0.5rem', opacity: loading ? 0.4 : 1 }} />
            Actualiser
          </button>
          <button
            className="premium-btn"
            style={{ padding: '0.75rem 1.5rem', background: '#f2c811', color: '#000', fontWeight: 900, boxShadow: '0 8px 24px rgba(242,200,17,0.18)' }}
            onClick={handleOpen}
            disabled={opening}
          >
            <ExternalLink size={16} style={{ marginRight: '0.7rem' }} />
            {opening ? 'Ouverture…' : 'Ouvrir Power BI Desktop'}
          </button>
        </div>
      </div>

      {/* SYNC STATUS STRIP */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>

        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '3px solid var(--success)' }}>
          <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 900, opacity: 0.4, textTransform: 'uppercase', letterSpacing: '2px' }}>Dernier ETL</p>
          <h3 style={{ margin: '0.5rem 0 0', fontSize: '1.05rem', fontWeight: 950 }}>
            {loading ? '—' : formatDate(status?.last_etl)}
          </h3>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '3px solid var(--accent)' }}>
          <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 900, opacity: 0.4, textTransform: 'uppercase', letterSpacing: '2px' }}>Source de données</p>
          <h3 style={{ margin: '0.5rem 0 0', fontSize: '1.05rem', fontWeight: 950 }}>
            {loading ? '—' : (status?.sync_source || '—')}
          </h3>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '3px solid var(--premium)' }}>
          <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 900, opacity: 0.4, textTransform: 'uppercase', letterSpacing: '2px' }}>Employés actifs</p>
          <h3 style={{ margin: '0.5rem 0 0', fontSize: '1.05rem', fontWeight: 950 }}>
            {loading ? '—' : (status?.row_counts?.employees ?? '—')} enregistrements
          </h3>
        </div>

      </div>

      {/* TASK SCHEDULER PANEL */}
      <div className="glass-panel" style={{ padding: '1.8rem 2rem', borderLeft: '4px solid var(--accent)', background: 'linear-gradient(90deg, rgba(99,102,241,0.04) 0%, transparent 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
            <div className="nexus-glow-orb" style={{ width: 44, height: 44, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <Timer size={20} color="var(--accent)" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 950 }}>Auto-Refresh Scheduler</h3>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.7rem', opacity: 0.45, fontWeight: 700 }}>
                Windows Task Scheduler — déclenche Power BI à 02:30 (après ETL 02:00)
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Status indicator */}
            <div style={{ padding: '0.35rem 0.9rem', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 900,
              background: schedule?.registered ? 'rgba(52,199,89,0.1)' : 'rgba(245,158,11,0.1)',
              color: schedule?.registered ? 'var(--success)' : 'var(--warning)',
              border: `1px solid ${schedule?.registered ? 'rgba(52,199,89,0.2)' : 'rgba(245,158,11,0.2)'}` }}>
              {schedule === null ? '…' : schedule.registered ? 'PLANIFIÉ' : 'NON PLANIFIÉ'}
            </div>

            {!schedule?.registered ? (
              <button className="premium-btn"
                style={{ padding: '0.6rem 1.2rem', background: 'var(--accent)', color: '#fff', fontWeight: 800, fontSize: '0.8rem', opacity: schedOp ? 0.6 : 1 }}
                onClick={() => handleScheduleAction('register')}
                disabled={!!schedOp}>
                <CheckCircle2 size={14} style={{ marginRight: '0.5rem' }} />
                {schedOp === 'register' ? 'Installation…' : 'Installer la tâche'}
              </button>
            ) : (
              <>
                <button className="premium-btn"
                  style={{ padding: '0.6rem 1.1rem', background: 'rgba(52,199,89,0.1)', color: 'var(--success)', border: '1px solid rgba(52,199,89,0.2)', fontWeight: 800, fontSize: '0.8rem', opacity: schedOp ? 0.6 : 1 }}
                  onClick={() => handleScheduleAction('run-now')}
                  disabled={!!schedOp}>
                  <Play size={13} style={{ marginRight: '0.5rem' }} />
                  {schedOp === 'run-now' ? 'Démarrage…' : 'Exécuter maintenant'}
                </button>
                <button className="premium-btn"
                  style={{ padding: '0.6rem 1rem', background: 'rgba(239,68,68,0.08)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.15)', fontWeight: 800, fontSize: '0.8rem', opacity: schedOp ? 0.6 : 1 }}
                  onClick={() => handleScheduleAction('unregister')}
                  disabled={!!schedOp}>
                  <Trash2 size={13} style={{ marginRight: '0.5rem' }} />
                  {schedOp === 'unregister' ? 'Suppression…' : 'Supprimer'}
                </button>
              </>
            )}
          </div>
        </div>

        {schedule?.registered && schedule.task && (
          <div style={{ marginTop: '1rem', padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, opacity: 0.5 }}>
              TÂCHE <span style={{ color: 'var(--text)', opacity: 1 }}>{schedule.task.name}</span>
            </span>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, opacity: 0.5 }}>
              ÉTAT <span style={{ color: 'var(--success)', opacity: 1 }}>{schedule.task.state}</span>
            </span>
            {schedule.task.lastRun && (
              <span style={{ fontSize: '0.7rem', fontWeight: 700, opacity: 0.5 }}>
                DERNIER LANCEMENT <span style={{ color: 'var(--text)', opacity: 1 }}>{formatDate(schedule.task.lastRun)}</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* DATASET TABLE + PROCEDURE */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '2rem' }}>

        {/* DATASET ENDPOINTS */}
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 950 }}>Endpoints Dataset Power Query</h3>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.7rem', opacity: 0.4, fontWeight: 700 }}>CLIQUEZ SUR UN ENDPOINT POUR COPIER L'URL</p>
            </div>
            <Network size={18} color="var(--accent)" />
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '0.8rem 1.5rem', textAlign: 'left', fontSize: '0.65rem', fontWeight: 900, opacity: 0.4, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Table</th>
                <th style={{ padding: '0.8rem 1.5rem', textAlign: 'left', fontSize: '0.65rem', fontWeight: 900, opacity: 0.4, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Lignes</th>
                <th style={{ padding: '0.8rem 1.5rem', textAlign: 'left', fontSize: '0.65rem', fontWeight: 900, opacity: 0.4, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Endpoint (copier)</th>
              </tr>
            </thead>
            <tbody>
              {TABLE_META.map(({ key, label, icon: Icon, endpoint }) => {
                const rows = status?.row_counts?.[key];
                const isCopied = copied === endpoint;
                return (
                  <tr key={key} style={{ borderTop: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '0.9rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <Icon size={15} color="var(--accent)" />
                        <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>{label}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.9rem 1.5rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 950, color: rows ? 'var(--success)' : 'var(--text-dim)' }}>
                        {loading ? '…' : (rows !== undefined ? rows : '—')}
                      </span>
                    </td>
                    <td style={{ padding: '0.9rem 1.5rem' }}>
                      <button
                        onClick={() => copyEndpoint(endpoint)}
                        style={{ background: isCopied ? 'rgba(52,199,89,0.1)' : 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '0.35rem 0.8rem', cursor: 'pointer', color: isCopied ? 'var(--success)' : 'var(--text-dim)', fontSize: '0.7rem', fontWeight: 800, fontFamily: 'monospace', transition: 'all 0.2s' }}
                      >
                        {isCopied ? '✓ Copié' : `…${endpoint}`}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* PROCEDURE PANEL */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h4 style={{ margin: '0 0 1.5rem', fontSize: '0.7rem', fontWeight: 900, opacity: 0.4, textTransform: 'uppercase', letterSpacing: '2px' }}>Procédure Power Query M</h4>

            {[
              {
                n: '1',
                title: 'Ouvrir le modèle',
                body: 'Cliquez sur "Ouvrir Power BI Desktop". Le fichier OPALIAHR_DASH.pbix se lance automatiquement.'
              },
              {
                n: '2',
                title: 'Remplacer la source PostgreSQL',
                body: 'Dans Power Query, remplacez chaque connexion PostgreSQL par la formule Web connector ci-dessous.'
              },
              {
                n: '3',
                title: 'Formule Power Query M',
                body: null,
                code: '= Json.Document(\n    Web.Contents(\n      "http://localhost:3000\n       /api/powerbi/dataset/employees"\n    )\n  )'
              },
              {
                n: '4',
                title: 'Actualiser',
                body: 'Cliquez sur Accueil → Actualiser. Power BI relit chaque endpoint et affiche les dernières données ETL.'
              }
            ].map(({ n, title, body, code }) => (
              <div key={n} className="glass-panel premium-hover" style={{ padding: '1.2rem 1.4rem', background: 'rgba(255,255,255,0.02)', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.9rem' }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#f2c811', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 950, flexShrink: 0, marginTop: '2px' }}>{n}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 900, marginBottom: '0.4rem' }}>{title}</div>
                    {body && <p style={{ margin: 0, fontSize: '0.72rem', opacity: 0.5, lineHeight: 1.6 }}>{body}</p>}
                    {code && (
                      <pre style={{ margin: '0.4rem 0 0', padding: '0.8rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', fontSize: '0.68rem', color: '#f2c811', lineHeight: 1.6, overflowX: 'auto', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                        {code}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* NEXUS ENGINE TIP */}
          <div style={{ marginTop: 'auto', padding: '1.2rem 1.4rem', background: 'rgba(242,200,17,0.05)', borderRadius: '14px', border: '1px solid rgba(242,200,17,0.12)' }}>
            <div style={{ display: 'flex', gap: '0.8rem', color: '#f2c811' }}>
              <Zap size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
              <p style={{ margin: 0, fontSize: '0.72rem', fontWeight: 700, lineHeight: 1.6, opacity: 0.9 }}>
                Le signal de refresh est écrit automatiquement par n8n après chaque ETL nightly. Power BI relit les endpoints à chaque clic "Actualiser" — aucune configuration PostgreSQL requise.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Page13_PowerBI;
