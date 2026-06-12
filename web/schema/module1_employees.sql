-- ==========================================
-- MODULE 1: EMPLOYEE MANAGEMENT SYSTEM
-- POSTGRESQL SCHEMA v1.0
-- ==========================================

-- Enum types for strict validation
CREATE TYPE employment_type AS ENUM ('Permanent', 'CDD', 'Stage', 'Intérim', 'Freelance');
CREATE TYPE doc_category AS ENUM ('Contrat', 'Identité', 'RIB', 'Visite Médicale', 'Avenant', 'Autre');
CREATE TYPE user_role AS ENUM ('Admin', 'Manager', 'Employee');

-- 1. Departments Hierarchy
CREATE TABLE IF NOT EXISTS departments (
    dept_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    manager_id UUID, -- self-referencing foreign key to employees added later
    budget NUMERIC(15,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Core Employees Table
CREATE TABLE IF NOT EXISTS employees (
    employee_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matricule VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    
    -- Organizational
    dept_id UUID REFERENCES departments(dept_id) ON DELETE SET NULL,
    job_title VARCHAR(150),
    employment_type employment_type NOT NULL,
    
    -- Status & Lifecycle
    hire_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'Actif', -- Actif, En Congé, Parti
    
    -- Metrics
    base_salary NUMERIC(10,2),
    birth_date DATE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Associate department manager back to employees
ALTER TABLE departments ADD CONSTRAINT fk_manager FOREIGN KEY (manager_id) REFERENCES employees(employee_id) ON DELETE SET NULL;

-- 3. Users Table (Authentication) mapping 1-to-1 with Employee
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID UNIQUE REFERENCES employees(employee_id) ON DELETE CASCADE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'Employee',
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Employee Digital Files (Documents Vault)
CREATE TABLE IF NOT EXISTS employee_documents (
    doc_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(employee_id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
    
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL, -- S3 URI or local volume path
    category doc_category NOT NULL,
    file_size_kb INT,
    
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create updated_at trigger for employees
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trg_employees_upd
    BEFORE UPDATE ON employees
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Indexes for performance
CREATE INDEX idx_emp_dept ON employees(dept_id);
CREATE INDEX idx_emp_status ON employees(status);
CREATE INDEX idx_docs_emp ON employee_documents(employee_id);
