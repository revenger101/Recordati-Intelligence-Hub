const db = require('../config/db.config');

/**
 * MODULE 3: Time Tracking & Attendance Controller
 * Handles Absences, Leaves, Remote Work requests, and Clock-ins
 */

// ==========================================
// 1. LEAVE REQUESTS (Demandes de congés)
// ==========================================

exports.submitLeaveRequest = async (req, res) => {
    try {
        const { employee_id, category, start_date, end_date, start_half_day, end_half_day, duration_days, reason } = req.body;
        
        // Anti-fraud: Verify employee has enough balance before allowing "Pending" state
        if (['Congé Payé', 'RTT'].includes(category)) {
            const currentYear = new Date().getFullYear();
            const balQ = `SELECT (conges_payes_acquis - conges_payes_pris) as cp_reste FROM leave_balances WHERE employee_id = $1 AND year = $2`;
            const balRes = await db.query(balQ, [employee_id, currentYear]);
            if (balRes.rowCount > 0 && balRes.rows[0].cp_reste < duration_days) {
                return res.status(400).json({ success: false, message: "Solde insuffisant pour cette demande." });
            }
        }

        const query = `
            INSERT INTO leave_requests 
            (employee_id, category, start_date, end_date, start_half_day, end_half_day, duration_days, reason, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Pending Manager')
            RETURNING *
        `;
        const values = [employee_id, category, start_date, end_date, start_half_day || false, end_half_day || false, duration_days, reason];
        const result = await db.query(query, values);
        
        res.status(201).json({ success: true, message: 'Demande soumise avec succès.', data: result.rows[0] });
    } catch (error) {
        console.error('Error submitting leave req:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.approveLeaveRequest = async (req, res) => {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        const { request_id } = req.params;
        const manager_id = req.user.employee_id; // Using JWT payload

        // 1. Fetch Request Details
        const getReq = await client.query('SELECT * FROM leave_requests WHERE request_id = $1', [request_id]);
        if (getReq.rowCount === 0) throw new Error('NOT_FOUND');
        const reqData = getReq.rows[0];

        if (reqData.status === 'Approved') {
            return res.status(400).json({ success: false, message: 'Demande déjà approuvée.' });
        }

        // 2. Set to Approved
        await client.query(`
            UPDATE leave_requests 
            SET status = 'Approved', manager_reviewer_id = $1, reviewed_at = CURRENT_TIMESTAMP 
            WHERE request_id = $2
        `, [manager_id, request_id]);

        // 3. Deduct Balance Automatically if it's CP or RTT
        if (['Congé Payé', 'RTT'].includes(reqData.category)) {
            const currentYear = new Date(reqData.start_date).getFullYear();
            const deductQ = `
                UPDATE leave_balances 
                SET conges_payes_pris = conges_payes_pris + $1 
                WHERE employee_id = $2 AND year = $3
            `;
            await client.query(deductQ, [reqData.duration_days, reqData.employee_id, currentYear]);
        }

        await client.query('COMMIT');
        res.status(200).json({ success: true, message: 'Absence validée et soldes déduits.' });
    } catch (error) {
        await client.query('ROLLBACK');
        if (error.message === 'NOT_FOUND') return res.status(404).json({ success: false, message: 'Request non trouvée.' });
        console.error('Approve error:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    } finally {
        client.release();
    }
};

// ==========================================
// 2. TIME CLOCK (Pointeuse & Horodatage)
// ==========================================

exports.clockInOut = async (req, res) => {
    try {
        const { employee_id } = req.user; // Auto-detected from JWT login
        const { type } = req.body; // 'Check-In' | 'Check-Out'
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        // Simple validation to prevent double check-ins
        const checkQ = `
            SELECT type FROM time_logs 
            WHERE employee_id = $1 AND DATE(log_time) = CURRENT_DATE 
            ORDER BY log_time DESC LIMIT 1
        `;
        const stateRes = await db.query(checkQ, [employee_id]);
        
        if (stateRes.rowCount > 0 && stateRes.rows[0].type === type) {
            return res.status(400).json({ success: false, message: `Vous avez déjà enregistré un ${type} récemmment.` });
        }

        const query = `
            INSERT INTO time_logs (employee_id, type, location_ip)
            VALUES ($1, $2, $3) RETURNING *
        `;
        const result = await db.query(query, [employee_id, type, ip]);
        
        res.status(201).json({ success: true, message: `Pointage ${type} enregistré à ${result.rows[0].log_time}`, data: result.rows[0] });
    } catch (error) {
        console.error('Error clocking in/out:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
