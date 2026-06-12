-- ==========================================
-- MODULE 3: TIME TRACKING & ATTENDANCE
-- POSTGRESQL SCHEMA v1.0
-- ==========================================

-- Enum Types for Validation
CREATE TYPE leave_category AS ENUM ('Congé Payé', 'RTT', 'Maladie', 'Sans Solde', 'Maternité', 'Paternité', 'Télétravail', 'Récupération');
CREATE TYPE leave_status AS ENUM ('Draft', 'Pending Manager', 'Pending HR', 'Approved', 'Rejected', 'Cancelled');
CREATE TYPE attendance_type AS ENUM ('Check-In', 'Check-Out', 'Break-Start', 'Break-End');
CREATE TYPE anomaly_type AS ENUM ('Retard', 'Oubli Badgeage', 'Heures Sup Non Validees', 'Absence Injustifiée');

-- 1. Leave Balances (Solde de congés par employé)
CREATE TABLE IF NOT EXISTS leave_balances (
    balance_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(employee_id) ON DELETE CASCADE,
    year INT NOT NULL,
    
    -- Categories of balances
    conges_payes_acquis NUMERIC(5,2) DEFAULT 0.00,
    conges_payes_pris NUMERIC(5,2) DEFAULT 0.00,
    rtt_acquis NUMERIC(5,2) DEFAULT 0.00,
    rtt_pris NUMERIC(5,2) DEFAULT 0.00,
    recuperations_heures NUMERIC(5,2) DEFAULT 0.00, -- en heures
    
    UNIQUE(employee_id, year)
);

-- 2. Leave Requests (Demandes d'absence et télétravail)
CREATE TABLE IF NOT EXISTS leave_requests (
    request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(employee_id) ON DELETE CASCADE,
    category leave_category NOT NULL,
    
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    start_half_day BOOLEAN DEFAULT false,
    end_half_day BOOLEAN DEFAULT false,
    duration_days NUMERIC(5,2) NOT NULL,
    
    status leave_status DEFAULT 'Pending Manager',
    reason TEXT,
    attachment_path TEXT, -- Justificatif Maladie, etc.
    
    manager_reviewer_id UUID REFERENCES employees(employee_id),
    hr_reviewer_id UUID REFERENCES employees(employee_id),
    reviewed_at TIMESTAMP,
    rejection_reason TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Time Clock / Pointeuse (Horodatage)
CREATE TABLE IF NOT EXISTS time_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(employee_id) ON DELETE CASCADE,
    
    log_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    type attendance_type NOT NULL,
    
    location_ip VARCHAR(45),
    device_info VARCHAR(255),
    is_manual_entry BOOLEAN DEFAULT false -- Si corrigé ou entré par RH
);

-- 4. Anomalies Tracking (Alertes: Retards, etc.)
CREATE TABLE IF NOT EXISTS attendance_anomalies (
    anomaly_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(employee_id) ON DELETE CASCADE,
    
    anomaly_date DATE NOT NULL,
    type anomaly_type NOT NULL,
    description TEXT,
    is_resolved BOOLEAN DEFAULT false,
    resolved_by UUID REFERENCES users(user_id),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Triggers to auto-calculate duration_days (simplified function simulation)
-- Also a Trigger to deduct from leave_balances when status is changed to 'Approved'

-- Indexes
CREATE INDEX idx_leave_req_emp ON leave_requests(employee_id);
CREATE INDEX idx_leave_req_status ON leave_requests(status);
CREATE INDEX idx_time_logs_date ON time_logs(employee_id, log_time);
