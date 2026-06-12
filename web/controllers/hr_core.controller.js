const db = require('../config/db.config');

/**
 * MODULES 4 - 10: CORE HR & ANALYTICS CONTROLLER
 * Consolidates endpoints for Payroll, Performance, LMS, and Analytics Integration.
 */

// ==========================================
// MODULE 4: PAYROLL SIMULATION & BULLETINS
// ==========================================
exports.generatePayrollCycle = async (req, res) => {
    try {
        const { month, year } = req.body;
        
        // 1. Create Cycle
        const cycleQ = `INSERT INTO payroll_cycles (month, year) VALUES ($1, $2) RETURNING cycle_id`;
        const cycleRes = await db.query(cycleQ, [month, year]);
        const cycleId = cycleRes.rows[0].cycle_id;

        // 2. Fetch Active Employees
        const empQ = `SELECT employee_id, base_salary FROM employees WHERE status = 'Actif'`;
        const emps = await db.query(empQ);

        // 3. Automated Payslip calculation (Basic)
        for (let emp of emps.rows) {
            const netPay = emp.base_salary * 0.78; // Simulate 22% social deductions
            await db.query(
                `INSERT INTO payslips (employee_id, cycle_id, base_salary, net_pay) VALUES ($1, $2, $3, $4)`,
                [emp.employee_id, cycleId, emp.base_salary, netPay]
            );
        }

        res.status(201).json({ success: true, message: `Payroll generated for ${month}/${year}`, processed: emps.rowCount });
    } catch (error) {
        if (error.code === '23505') return res.status(400).json({ success: false, message: 'Cycle already exists for this date.' });
        console.error('Payroll generation error:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// ==========================================
// MODULE 5: PERFORMANCE (OKRs)
// ==========================================
exports.recordPerformanceReview = async (req, res) => {
    try {
        const { employee_id, review_period, overall_score, nine_box_grid_position, manager_feedback } = req.body;
        const query = `
            INSERT INTO performance_reviews 
            (employee_id, reviewer_id, review_period, overall_score, nine_box_grid_position, manager_feedback, status, completed_date)
            VALUES ($1, $2, $3, $4, $5, $6, 'Completed', CURRENT_DATE) RETURNING *
        `;
        const result = await db.query(query, [employee_id, req.user.employee_id, review_period, overall_score, nine_box_grid_position, manager_feedback]);
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Review error:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// ==========================================
// MODULE 6: TRAINING (LMS)
// ==========================================
exports.assignCertification = async (req, res) => {
    try {
        const { employee_id, course_id, obtained_date, expiry_date } = req.body;
        const query = `
            INSERT INTO certifications (employee_id, course_id, obtained_date, expiry_date)
            VALUES ($1, $2, $3, $4) RETURNING *
        `;
        const result = await db.query(query, [employee_id, course_id, obtained_date, expiry_date]);
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// ==========================================
// MODULE 8: EMPLOYEE SELF-SERVICE PORTAL
// ==========================================
exports.getMyPortalData = async (req, res) => {
    try {
        const myId = req.user.employee_id;
        
        // Parallel fetching for high performance portal loading
        const [profile, leaves, payslips] = await Promise.all([
            db.query(`SELECT * FROM employees WHERE employee_id = $1`, [myId]),
            db.query(`SELECT * FROM leave_requests WHERE employee_id = $1 ORDER BY start_date DESC LIMIT 5`, [myId]),
            db.query(`SELECT cycle_id, net_pay FROM payslips WHERE employee_id = $1 ORDER BY created_at DESC LIMIT 5`, [myId])
        ]);

        res.status(200).json({
            success: true,
            data: {
                profile: profile.rows[0],
                recent_leaves: leaves.rows,
                recent_payslips: payslips.rows
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// ==========================================
// MODULE 9 & 10: COMPLIANCE ANALYTICS & API
// ==========================================
exports.getAnalyticsDashboard = async (req, res) => {
    try {
        const kpis = await db.query(`SELECT * FROM analytics_workforce_kpi`);
        res.status(200).json({ success: true, data: kpis.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
