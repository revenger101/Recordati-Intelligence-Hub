const path = require('path');
const fs = require('fs');
const WAREHOUSE_DIR = path.join(__dirname, '../DataWarehouse');

const getCSVData = (filename) => {
  const filePath = path.join(WAREHOUSE_DIR, filename);
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') inQuotes = !inQuotes;
      else if (char === ',' && !inQuotes) { values.push(current.trim()); current = ''; }
      else current += char;
    }
    values.push(current.trim());
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']));
  });
};

const countRows = (filename) => {
  try {
    const fp = path.join(WAREHOUSE_DIR, filename);
    if (!fs.existsSync(fp)) return 0;
    const lines = fs.readFileSync(fp, 'utf-8').split('\n').filter(l => l.trim());
    return Math.max(0, lines.length - 1);
  } catch { return 0; }
};

const tables = [
  ['employees',   'Dim_Employee.csv'],
  ['absences',    'Fact_Absence.csv'],
  ['turnover',    'Fact_Turnover.csv'],
  ['snapshots',   'Fact_Employee_Snapshot.csv'],
  ['recruitment', 'Fact_Recruitment.csv'],
  ['departments', 'Dim_Department.csv'],
  ['positions',   'Dim_Position.csv'],
  ['dates',       'Dim_Date.csv'],
  ['predictions', 'predictions_log.csv'],
  ['fact-emp',    'fact_employee.csv'],
];

let allOk = true;
console.log('\n=== DataWarehouse Endpoint Test ===\n');
tables.forEach(([key, file]) => {
  const rows = getCSVData(file);
  const count = countRows(file);
  const sampleKeys = rows[0] ? Object.keys(rows[0]).slice(0, 4).join(', ') : 'EMPTY';
  const status = rows.length > 0 ? 'OK' : 'WARN';
  if (rows.length === 0) allOk = false;
  console.log(`[${status}] /api/powerbi/dataset/${key.padEnd(12)} ${String(rows.length).padStart(6)} rows | ${sampleKeys}`);
});

// Test signal path
const signalPath = path.join(WAREHOUSE_DIR, 'refresh_signal.json');
if (fs.existsSync(signalPath)) {
  const sig = JSON.parse(fs.readFileSync(signalPath, 'utf-8'));
  console.log('\n[OK] refresh_signal.json:', JSON.stringify(sig));
} else {
  console.log('\n[INFO] refresh_signal.json: not yet created (will be written by n8n after first ETL run)');
}

console.log('\n' + (allOk ? 'ALL TABLES HAVE DATA — endpoints ready for Power BI.' : 'SOME TABLES EMPTY — check DataWarehouse CSVs.'));

// Status object that /api/powerbi/status will return
const row_counts = {};
tables.forEach(([key, file]) => { row_counts[key.replace('-emp', '-employee')] = countRows(file); });
console.log('\n/api/powerbi/status preview:');
console.log(JSON.stringify({ last_etl: null, status: 'pending', sync_source: 'DataWarehouse (CSV Star Schema)', row_counts }, null, 2));
