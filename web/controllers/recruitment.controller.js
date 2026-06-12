const db = require('../config/db.config');

/**
 * MODULE 2: Recruitment & ATS Controller
 * Handles Applicant Tracking, Job Requisitions, and Onboarding tasks.
 */

// ==========================================
// 1. JOB REQUISITIONS (Postes)
// ==========================================

exports.createJobRequisition = async (req, res) => {
    try {
        const { req_code, title, dept_id, hiring_manager_id, headcount, employment_type, target_hire_date } = req.body;
        
        const query = `
            INSERT INTO job_requisitions 
            (req_code, title, dept_id, hiring_manager_id, headcount, employment_type, target_hire_date)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        const values = [req_code, title, dept_id, hiring_manager_id, headcount, employment_type, target_hire_date];
        
        const result = await db.query(query, values);
        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        if (error.code === '23505') return res.status(400).json({ success: false, message: 'Requisition Code already exists.' });
        console.error('Error creating job:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.getOpenJobs = async (req, res) => {
    try {
        const query = `
            SELECT j.*, d.name as dept_name, e.first_name as manager_name
            FROM job_requisitions j
            LEFT JOIN departments d ON j.dept_id = d.dept_id
            LEFT JOIN employees e ON j.hiring_manager_id = e.employee_id
            WHERE j.status IN ('Open', 'Draft')
            ORDER BY j.created_at DESC
        `;
        const result = await db.query(query);
        res.status(200).json({ success: true, count: result.rowCount, data: result.rows });
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// ==========================================
// 2. CANDIDATE PIPELINE (Candidatures)
// ==========================================

exports.applyForJob = async (req, res) => {
    // Uses a transaction to create candidate AND application safely
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        const { job_id, first_name, last_name, email, phone, linkedin_url, source } = req.body;

        // 1. Create or Find Candidate
        let candidateId;
        const findCand = await client.query('SELECT candidate_id FROM candidates WHERE email = $1', [email]);
        
        if (findCand.rowCount > 0) {
            candidateId = findCand.rows[0].candidate_id;
        } else {
            const insCand = await client.query(`
                INSERT INTO candidates (first_name, last_name, email, phone, linkedin_url, source)
                VALUES ($1, $2, $3, $4, $5, $6) RETURNING candidate_id
            `, [first_name, last_name, email, phone, linkedin_url, source]);
            candidateId = insCand.rows[0].candidate_id;
        }

        // 2. Assign to Job Requisition
        const appRes = await client.query(`
            INSERT INTO applications (candidate_id, job_id, stage)
            VALUES ($1, $2, 'Applied') RETURNING *
        `, [candidateId, job_id]);

        await client.query('COMMIT');
        res.status(201).json({ success: true, message: 'Candidature enregistrée avec succès.', data: appRes.rows[0] });
    } catch (error) {
        await client.query('ROLLBACK');
        if (error.code === '23505') {
            return res.status(400).json({ success: false, message: 'Le candidat a déjà postulé à cette offre.' });
        }
        console.error('Application error:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    } finally {
        client.release();
    }
};

exports.updateApplicationStage = async (req, res) => {
    try {
        const { id } = req.params; // application_id
        const { stage, feedback_notes, rating } = req.body;
        
        const query = `
            UPDATE applications 
            SET stage = COALESCE($1, stage), 
                feedback_notes = COALESCE($2, feedback_notes), 
                rating = COALESCE($3, rating)
            WHERE application_id = $4 RETURNING *
        `;
        const result = await db.query(query, [stage, feedback_notes, rating, id]);
        
        if (result.rowCount === 0) return res.status(404).json({ success: false, message: 'Application not found' });
        res.status(200).json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error updating application:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// ==========================================
// 3. ONBOARDING (Checklist d'intégration)
// ==========================================

exports.checkOffOnboardingTask = async (req, res) => {
    try {
        const { tracker_id } = req.params;
        const query = `
            UPDATE employee_onboarding 
            SET status = 'Completed', completion_date = CURRENT_DATE 
            WHERE tracker_id = $1 RETURNING *
        `;
        const result = await db.query(query, [tracker_id]);
        
        if (result.rowCount === 0) return res.status(404).json({ success: false, message: 'Task not found' });
        res.status(200).json({ success: true, message: 'Task completed', data: result.rows[0] });
    } catch (error) {
        console.error('Error checking off task:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
