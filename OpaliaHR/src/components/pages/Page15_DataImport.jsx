import React, { useState, useMemo } from 'react';
import { UploadCloud, FileText, Database, RefreshCcw } from 'lucide-react';

const synonymGroups = {
  employee_id: ['EMPLOYEE ID', 'EMP ID', 'EMPID', 'MATRICULE', 'ID', 'NUMERO', 'CODE'],
  name: ['FULL NAME', 'NAME', 'NOM', 'NOM PRENOM', 'NOM & PRENOM', 'NOM ET PRENOM', 'EMPLOYEE NAME'],
  department: ['DEPARTMENT', 'DEPT', 'SERVICE', 'DEPARTEMENT', 'DIRECTION', 'DIVISION', 'TEAM'],
  position: ['POSITION', 'JOB TITLE', 'POSTE', 'FONCTION', 'ROLE', 'JOB'],
  salary: ['SALARY', 'MONTHLYSALARY', 'REMUNERATION', 'SALAIRE', 'PAY'],
  status: ['STATUS', 'STATUT', 'EMPLOYMENT STATUS', 'ACTIF', 'ACTIVE'],
  gender: ['GENDER', 'SEXE', 'GENRE', 'M/F'],
  age: ['AGE', 'AGE_ANNEE', 'ANNÉE'],
  tenure_months: ['TENURE', 'TENURE MONTHS', 'ANCIENNETE', 'SENIORITY', 'ANCIENNETE MOIS', 'ANCIENNETE_MOIS'],
  absence_days: ['ABSENCE DAYS', 'DAYS ABSENT', 'DUREE_JOURS', 'NBRJOURS', 'NB JOURS', 'ABSENCE'],
  turnover_flag: ['TURNOVER FLAG', 'LEAVE', 'QUIT', 'DEPARTURE', 'PARTI', 'DEPART'],
  date: ['DATE', 'DATEKEY', 'DATE KEY', 'TRANSACTIONDATE', 'DATE DEPART', 'DATE EMB', 'DATE EMBECHE'],
};

const normalizeHeader = header => String(header || '').trim().toUpperCase().replace(/[^A-Z0-9]+/g, ' ');
const matches = (header, terms) => terms.some(term => normalizeHeader(header).includes(term));

const splitRow = line => {
  const re = /,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/;
  return line.split(re).map(cell => cell.replace(/^\s*"|"\s*$/g, '').trim());
};

const parseCSVText = text => {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (!lines.length) return [];
  const headers = splitRow(lines[0]);
  return lines.slice(1).map(line => {
    const values = splitRow(line);
    const row = {};
    headers.forEach((h, idx) => { row[h] = values[idx] ?? ''; });
    return row;
  });
};

const inferTableType = (filename, headers) => {
  const text = `${filename} ${headers.join(' ')}`.toUpperCase();
  if (/TURNOVER|DEPART|SORTANT|QUIT|RESIGN|TERMINATION/.test(text)) return 'turnover';
  if (/ABSENCE|CONGES|ARRET|DUREE|ABS/.test(text)) return 'absence';
  if (/RECRUIT|EMBAUCHE|HIR|COUT|PROBATION/.test(text)) return 'recruitment';
  if (/SNAPSHOT|HEADCOUNT|WORKED HOURS|HEURES|PRESENT|PRESENTE/.test(text)) return 'snapshot';
  if (/ATTRITION|RISK|FEATURES|TURNOVER FLAG|TENURE|SALARY/.test(text)) return 'attrition';
  if (/EMPLOYEE|COLLABORATEUR|NOM|PRENOM|MATRICULE|DEPARTEMENT|SERVICE|POSTE/.test(text)) return 'employee';
  return 'employee';
};

const findHeader = (headers, key) => {
  const terms = synonymGroups[key] || [];
  return headers.find(h => matches(h, terms)) || null;
};

const parseNumber = value => {
  if (value == null || value === '') return 0;
  const cleaned = String(value).replace(/[^0-9.,-]/g, '').replace(',', '.');
  return Number(cleaned) || 0;
};

const buildEmployeeRow = obj => {
  const headers = Object.keys(obj);
  const employeeKey = findHeader(headers, 'employee_id');
  const name = findHeader(headers, 'name');
  const department = findHeader(headers, 'department');
  const position = findHeader(headers, 'position');
  const salary = findHeader(headers, 'salary');
  const status = findHeader(headers, 'status');
  const gender = findHeader(headers, 'gender');
  const age = findHeader(headers, 'age');
  const tenure = findHeader(headers, 'tenure_months');

  return {
    employee_id: obj[employeeKey] || obj[findHeader(headers, 'employee_id')] || obj.MATRICULE || obj.ID || `EMP_${Math.random().toString(36).slice(2, 8)}`,
    name: obj[name] || obj.NOM || obj.NOM_PRENOM || obj.NAME || 'Imported User',
    department: obj[department] || obj.DEPT || obj.SERVICE || obj.DEPARTMENT || 'NC',
    position: obj[position] || obj.POSTE || obj.FONCTION || obj.ROLE || 'Employee',
    salary: parseNumber(obj[salary] || obj.SALAIRE || obj.REMUNERATION),
    status: obj[status] || obj.STATUT || 'Actif',
    gender: obj[gender] || obj.SEXE || obj.GENRE || 'NC',
    age: parseNumber(obj[age] || obj.AGE),
    anciennete: parseNumber(obj[tenure] || obj.SENIORITY || obj.ANCIENNETE) / 12,
    risk_score: parseNumber(obj.RISK || obj.RISK_SCORE || obj.TURNOVER_PROBABILITY),
    absences: parseNumber(obj.ABSENCE_DAYS || obj.ABSENCES || obj.TOTAL_ABS || obj.ABSENCE),
  };
};

const buildSummaryFromEmployees = employees => {
  return employees.slice(0, 12).map((_, idx) => ({
    label: `M-${12 - idx}`,
    headcount: employees.length,
    departures: employees.filter(e => String(e.status).toLowerCase().includes('sortant')).length,
    total_salary: employees.reduce((sum, e) => sum + (Number(e.salary) || 0), 0),
  }));
};

const Page15_DataImport = ({ onImportData }) => {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [status, setStatus] = useState('Aucun fichier importé');
  const [importedTables, setImportedTables] = useState({});

  const handleFiles = async event => {
    const selected = Array.from(event.target.files || []);
    setFiles(selected);
    const parsed = [];
    const tables = {};

    for (const file of selected) {
      const text = await file.text();
      const rows = parseCSVText(text);
      const headers = rows.length ? Object.keys(rows[0]) : [];
      const type = inferTableType(file.name, headers);
      tables[type] = tables[type] ? [...tables[type], ...rows] : rows;
      parsed.push({ name: file.name, type, rows: rows.slice(0, 5) });
    }

    setImportedTables(tables);
    setPreviews(parsed);
    setStatus(`${selected.length} fichier(s) chargé(s)`);
  };

  const handleImport = () => {
    const employeeRows = importedTables.employee || [];
    const turnoverRows = importedTables.turnover || [];
    const absenceRows = importedTables.absence || [];
    const recruitmentRows = importedTables.recruitment || [];
    const snapshotRows = importedTables.snapshot || [];
    const attritionRows = importedTables.attrition || [];

    const employees = employeeRows.map(buildEmployeeRow);
    const importedEmployees = employees.length ? employees : [];

    const monthlyStats = snapshotRows.length
      ? snapshotRows.map((row, idx) => ({ label: `Snapshot ${idx + 1}`, headcount: Number(row.HEADCOUNT || row.headcount || 0), departures: 0, total_salary: parseNumber(row.SALARY || row.salary || 0) }))
      : buildSummaryFromEmployees(importedEmployees);

    const recommendations = [
      { id: 'rec-1', message: 'Données importées avec succès.', level: 'info' }
    ];

    onImportData({
      employees: importedEmployees,
      monthlyStats,
      recommendations,
    });

    setStatus('Import terminé — tableau mis à jour.');
  };

  const tableCounts = useMemo(() => {
    return Object.entries(importedTables).map(([type, rows]) => ({ type, count: rows.length }));
  }, [importedTables]);

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <div className="page-badge"><UploadCloud size={16} /></div>
          <h2>Importer les données</h2>
          <p className="page-description">Chargez des fichiers CSV contenant vos employés, départs, absences, recrutements ou snapshots. L'application va créer un entrepôt de données en mémoire et mettre à jour le dashboard.</p>
        </div>
      </div>

      <div className="import-panel glass-panel">
        <div className="import-section">
          <label className="upload-label" htmlFor="data-import-files">
            <div className="upload-box">
              <UploadCloud size={24} />
              <p>Déposez vos fichiers ici ou cliquez pour sélectionner</p>
              <small>CSV seulement pour l’instant.</small>
            </div>
          </label>
          <input id="data-import-files" type="file" accept=".csv" multiple onChange={handleFiles} style={{ display: 'none' }} />
        </div>

        <div className="import-summary">
          <div className="summary-card">
            <div className="card-icon"><Database size={18} /></div>
            <div>
              <h3>{files.length}</h3>
              <p>Fichiers sélectionnés</p>
            </div>
          </div>
          <div className="summary-card">
            <div className="card-icon"><FileText size={18} /></div>
            <div>
              <h3>{tableCounts.reduce((sum, row) => sum + row.count, 0)}</h3>
              <p>Lignes détectées</p>
            </div>
          </div>
          <div className="summary-card">
            <div className="card-icon"><RefreshCcw size={18} /></div>
            <div>
              <h3>{status}</h3>
              <p>Statut d’import</p>
            </div>
          </div>
        </div>

        <div className="import-actions">
          <button className="primary-btn" onClick={handleImport} disabled={!files.length}>
            Importer et mettre à jour le dashboard
          </button>
        </div>
      </div>

      <div className="preview-grid">
        {tableCounts.map(table => (
          <div key={table.type} className="preview-card glass-panel">
            <div className="preview-header">
              <span>{table.type}</span>
              <strong>{table.count}</strong>
            </div>
            <p>Enregistrements détectés pour {table.type}.</p>
          </div>
        ))}
      </div>

      {previews.length > 0 && (
        <div className="preview-table glass-panel">
          <h3>Aperçu des fichiers importés</h3>
          {previews.map(file => (
            <div key={file.name} className="file-preview">
              <h4>{file.name} — {file.type}</h4>
              <table>
                <thead>
                  <tr>{Object.keys(file.rows[0] || {}).slice(0, 6).map((col, idx) => <th key={idx}>{col}</th>)}</tr>
                </thead>
                <tbody>
                  {(file.rows || []).slice(0, 4).map((row, idx) => (
                    <tr key={idx}>
                      {Object.values(row).slice(0, 6).map((value, j) => <td key={j}>{value}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Page15_DataImport;
