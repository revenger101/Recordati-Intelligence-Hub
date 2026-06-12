const { Pool } = require('pg');
const pool = new Pool({
  user: 'rh_user',
  host: 'localhost',
  database: 'rh_db',
  password: 'password123',
  port: 5433,
});

async function check() {
  try {
    const res = await pool.query('SELECT employee_id, absences FROM fact_employee LIMIT 10');
    console.log(res.rows);
    const abs = await pool.query('SELECT count(*) FROM fact_absence');
    console.log('Total absences in fact_absence:', abs.rows[0].count);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
