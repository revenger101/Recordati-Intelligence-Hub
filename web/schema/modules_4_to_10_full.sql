-- ==========================================
-- MODULES 4 TO 10: FULL HR INFRASTRUCTURE
-- POSTGRESQL SCHEMA v1.0
-- ==========================================

-- ==========================================
-- MODULE 4: PAYROLL & ADMINISTRATION
-- ==========================================
CREATE TYPE payslip_status AS ENUM ('Draft', 'Validated', 'Paid');

CREATE TABLE IF NOT EXISTS payroll_cycles (
    cycle_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month INT NOT NULL,
    year INT NOT NULL,
    status payslip_status DEFAULT 'Draft',
    processed_date DATE,
    UNIQUE(month, year)
);

CREATE TABLE IF NOT EXISTS payslips (
    payslip_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(employee_id) ON DELETE CASCADE,
    cycle_id UUID REFERENCES payroll_cycles(cycle_id) ON DELETE CASCADE,
    
    base_salary NUMERIC(10,2) NOT NULL,
    total_bonuses NUMERIC(10,2) DEFAULT 0,
    total_deductions NUMERIC(10,2) DEFAULT 0,
    net_pay NUMERIC(10,2) NOT NULL,
    
    pdf_path TEXT, -- Archiving PDF for 50 years (S3 reference)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, cycle_id)
);

-- ==========================================
-- MODULE 5: PERFORMANCE & GOALS (OKRs)
-- ==========================================
CREATE TYPE review_status AS ENUM ('Scheduled', 'In Progress', 'Completed');

CREATE TABLE IF NOT EXISTS performance_reviews (
    review_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(employee_id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES employees(employee_id) ON DELETE SET NULL,
    
    review_period VARCHAR(50), -- e.g. "Q1-2026"
    status review_status DEFAULT 'Scheduled',
    overall_score NUMERIC(3,1), -- Out of 10 or 100
    nine_box_grid_position VARCHAR(50), -- Talent matrix (ex: 'High Potential')
    
    manager_feedback TEXT,
    employee_comments TEXT,
    completed_date DATE
);

CREATE TABLE IF NOT EXISTS okrs (
    okr_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(employee_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    target_metric NUMERIC(10,2),
    current_progress NUMERIC(10,2) DEFAULT 0,
    deadline DATE
);

-- ==========================================
-- MODULE 6: TRAINING & LMS
-- ==========================================
CREATE TABLE IF NOT EXISTS training_catalog (
    course_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    provider VARCHAR(100), -- Internal or External URL
    cost NUMERIC(10,2) DEFAULT 0,
    duration_hours INT
);

CREATE TABLE IF NOT EXISTS certifications (
    cert_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(employee_id) ON DELETE CASCADE,
    course_id UUID REFERENCES training_catalog(course_id) ON DELETE SET NULL,
    
    obtained_date DATE NOT NULL,
    expiry_date DATE,
    certificate_pdf_path TEXT
);

-- ==========================================
-- MODULE 7: CAREER MOBILITY & OFFBOARDING
-- ==========================================
CREATE TABLE IF NOT EXISTS career_history (
    history_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(employee_id) ON DELETE CASCADE,
    
    previous_job_title VARCHAR(150),
    new_job_title VARCHAR(150),
    previous_salary NUMERIC(10,2),
    new_salary NUMERIC(10,2),
    promotion_date DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS offboarding_sessions (
    offboard_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(employee_id) ON DELETE CASCADE,
    
    resignation_date DATE,
    last_working_day DATE NOT NULL,
    reason TEXT,
    equipment_returned BOOLEAN DEFAULT false,
    exit_interview_notes TEXT
);

-- ==========================================
-- MODULE 8 & 9: REPORTING & ANALYTICS VIEWS
-- ==========================================
-- Create a high-performance View for Dashboard Analytics (Absenteeism, Turnover, Headcount)
CREATE OR REPLACE VIEW analytics_workforce_kpi AS
SELECT 
    d.name AS department,
    COUNT(e.employee_id) AS total_headcount,
    AVG(e.base_salary) AS avg_salary,
    COUNT(CASE WHEN e.status = 'Parti' THEN 1 END) AS departures
FROM employees e
LEFT JOIN departments d ON e.dept_id = d.dept_id
GROUP BY d.name;

-- ==========================================
-- MODULE 10: INTEGRATIONS & WEBHOOKS
-- ==========================================
CREATE TABLE IF NOT EXISTS api_webhooks (
    webhook_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL, -- e.g. "employee.created"
    target_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    secret_key VARCHAR(255)
);
