-- ==========================================
-- MODULE 2: RECRUITMENT & ONBOARDING
-- POSTGRESQL SCHEMA v1.0
-- ==========================================

-- Enum types for Module 2 strict validation
CREATE TYPE job_status AS ENUM ('Draft', 'Open', 'On Hold', 'Closed', 'Cancelled');
CREATE TYPE application_stage AS ENUM ('Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected');
CREATE TYPE task_status AS ENUM ('Pending', 'In Progress', 'Completed', 'Overdue');
CREATE TYPE interview_format AS ENUM ('In-Person', 'Video', 'Phone');

-- 1. Job Requisitions (Open Positions)
CREATE TABLE IF NOT EXISTS job_requisitions (
    job_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    req_code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    dept_id UUID REFERENCES departments(dept_id) ON DELETE SET NULL,
    hiring_manager_id UUID REFERENCES employees(employee_id) ON DELETE SET NULL,
    
    headcount INT DEFAULT 1,
    employment_type employment_type NOT NULL,
    status job_status DEFAULT 'Draft',
    
    target_hire_date DATE,
    budget_range_min NUMERIC(15,2),
    budget_range_max NUMERIC(15,2),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Candidate Profiles Pool
CREATE TABLE IF NOT EXISTS candidates (
    candidate_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    linkedin_url VARCHAR(255),
    
    resume_path TEXT, -- Link to S3 / Vault
    source VARCHAR(100), -- LinkedIn, Cooptation, Site RH
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Applications (Pipeline Flow mapping Candidate to Job)
CREATE TABLE IF NOT EXISTS applications (
    application_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES candidates(candidate_id) ON DELETE CASCADE,
    job_id UUID REFERENCES job_requisitions(job_id) ON DELETE CASCADE,
    
    stage application_stage DEFAULT 'Applied',
    applied_date DATE DEFAULT CURRENT_DATE,
    
    rating INT CHECK (rating >= 1 AND rating <= 5),
    feedback_notes TEXT,
    
    UNIQUE(candidate_id, job_id) -- Prevent duplicate applying
);

-- 4. Interview Scheduling
CREATE TABLE IF NOT EXISTS interviews (
    interview_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES applications(application_id) ON DELETE CASCADE,
    interviewer_id UUID REFERENCES employees(employee_id) ON DELETE SET NULL,
    
    scheduled_time TIMESTAMP NOT NULL,
    duration_minutes INT DEFAULT 60,
    format interview_format DEFAULT 'Video',
    
    meeting_link VARCHAR(255),
    outcome_feedback TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Universal Onboarding Task Template Library
CREATE TABLE IF NOT EXISTS onboarding_templates (
    task_template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_name VARCHAR(255) NOT NULL,
    description TEXT,
    responsibility_dept_id UUID REFERENCES departments(dept_id), -- IT, HR, etc
    days_due_after_hire INT DEFAULT 7
);

-- 6. Personalized Employee Onboarding Tracker
CREATE TABLE IF NOT EXISTS employee_onboarding (
    tracker_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(employee_id) ON DELETE CASCADE,
    task_name VARCHAR(255) NOT NULL,
    
    assigned_to UUID REFERENCES employees(employee_id), -- usually IT admin or HR rep
    due_date DATE NOT NULL,
    status task_status DEFAULT 'Pending',
    completion_date DATE
);

-- Triggers 
CREATE TRIGGER trg_jobs_upd
    BEFORE UPDATE ON job_requisitions
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Analytics Indexes
CREATE INDEX idx_job_status ON job_requisitions(status);
CREATE INDEX idx_app_stage ON applications(stage);
CREATE INDEX idx_onboarding_status ON employee_onboarding(status);
