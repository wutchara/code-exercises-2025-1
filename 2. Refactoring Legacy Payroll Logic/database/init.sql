-- Table to store different types of employees
-- This supports the goal of adding "New employee types"
CREATE TABLE EmployeeTypes (
    employee_type_id INT PRIMARY KEY AUTO_INCREMENT,
    type_name VARCHAR(50) NOT NULL UNIQUE COMMENT 'e.g., contractor, full-time, part-time, intern',
    description TEXT COMMENT 'Optional description of the employee type'
);

-- Table to store department information (optional but good for organization)
CREATE TABLE Departments (
    department_id INT PRIMARY KEY AUTO_INCREMENT,
    department_name VARCHAR(100) NOT NULL UNIQUE,
    location VARCHAR(100)
);

-- Table to store core employee information
CREATE TABLE Employees (
    employee_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(20),
    hire_date DATE NOT NULL,
    employee_type_id INT NOT NULL,
    department_id INT,
    is_active BOOLEAN DEFAULT TRUE COMMENT 'To mark if the employee is currently active',
    
    CONSTRAINT fk_employee_type
        FOREIGN KEY (employee_type_id)
        REFERENCES EmployeeTypes(employee_type_id),
    CONSTRAINT fk_employee_department
        FOREIGN KEY (department_id)
        REFERENCES Departments(department_id)
);

-- Table to store payroll calculation data for each employee and pay period
CREATE TABLE PayrollCalculations (
    payroll_calculation_id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    pay_period_start_date DATE NOT NULL,
    pay_period_end_date DATE NOT NULL,
    
    -- Input factors for calculation
    working_hours DECIMAL(10, 2) COMMENT 'e.g., 120 hours as per example input',
    hourly_rate DECIMAL(10, 2) COMMENT 'Applicable for hourly employees/contractors',
    monthly_salary DECIMAL(12, 2) COMMENT 'Base salary for salaried employees for the period',
    
    -- Calculated pay components
    base_pay DECIMAL(12, 2) NOT NULL COMMENT 'Calculated pay before bonuses and deductions (e.g., hours * rate or salary portion)',
    bonus_amount DECIMAL(12, 2) DEFAULT 0.00 COMMENT 'Stores calculated bonus, supporting "Separated bonus calculation"',
    
    -- Deductions and Additions
    tax_deductions DECIMAL(12, 2) DEFAULT 0.00 COMMENT 'Stores results of "Custom tax/billing logic"',
    benefits_deductions DECIMAL(12, 2) DEFAULT 0.00,
    other_deductions DECIMAL(12, 2) DEFAULT 0.00,
    reimbursements DECIMAL(12, 2) DEFAULT 0.00,
    
    -- Final Pay
    net_pay DECIMAL(12, 2) NOT NULL COMMENT 'Total pay after all additions and deductions (corresponds to "total_pay")',
    
    -- Record keeping
    payment_date DATE COMMENT 'Date the payment was made',
    calculation_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When this payroll record was calculated/generated',
    notes TEXT COMMENT 'Any specific notes for this payroll entry',

    CONSTRAINT fk_payroll_employee
        FOREIGN KEY (employee_id)
        REFERENCES Employees(employee_id),
    
    -- Ensure a unique payroll entry per employee for a given pay period
    CONSTRAINT uq_employee_pay_period UNIQUE (employee_id, pay_period_start_date, pay_period_end_date)
);

-- Indexes for performance
CREATE INDEX idx_employees_employee_type_id ON Employees(employee_type_id);
CREATE INDEX idx_employees_department_id ON Employees(department_id);
CREATE INDEX idx_payroll_employee_period ON PayrollCalculations(employee_id, pay_period_start_date, pay_period_end_date);
CREATE INDEX idx_payroll_payment_date ON PayrollCalculations(payment_date);

-- Example: Inserting an Employee Type
INSERT INTO EmployeeTypes (type_name, description) VALUES ('contractor', 'Independent contractors');
INSERT INTO EmployeeTypes (type_name, description) VALUES ('full-time', 'Full-time permanent employees');
INSERT INTO EmployeeTypes (type_name, description) VALUES ('part-time', 'Part-time permanent employees');

-- Example: Inserting a Department
INSERT INTO Departments (department_name, location) VALUES ('Engineering', 'Building A');
INSERT INTO Departments (department_name, location) VALUES ('Human Resources', 'Building B');

-- Example: Inserting Employees
-- Assuming 'contractor' has employee_type_id = 1, 'full-time' = 2
-- Assuming 'Engineering' has department_id = 1, 'Human Resources' = 2

INSERT INTO Employees (first_name, last_name, email, phone_number, hire_date, employee_type_id, department_id, is_active)
VALUES
('Alice', 'Smith', 'alice.smith@example.com', '555-0101', '2022-08-15', 2, 1, TRUE), -- Full-time, Engineering
('Bob', 'Johnson', 'bob.johnson@example.com', '555-0102', '2023-01-20', 1, 1, TRUE), -- Contractor, Engineering
('Carol', 'Williams', 'carol.williams@example.com', '555-0103', '2021-05-10', 2, 2, TRUE), -- Full-time, Human Resources
('David', 'Brown', 'david.brown@example.com', '555-0104', '2023-11-01', 1, NULL, FALSE); -- Contractor, No specific department, Inactive

-- Example: Inserting Payroll Calculations
-- Assuming Alice (employee_id=1) is full-time salaried
-- Assuming Bob (employee_id=2) is a contractor paid hourly
-- Assuming Carol (employee_id=3) is full-time salaried with a bonus

-- Payroll for Alice (Salaried) for October 2023
INSERT INTO PayrollCalculations (employee_id, pay_period_start_date, pay_period_end_date, monthly_salary, base_pay, tax_deductions, benefits_deductions, net_pay, payment_date, notes)
VALUES
(1, '2023-10-01', '2023-10-31', 5000.00, 5000.00, 1200.00, 300.00, 3500.00, '2023-10-31', 'October salary for Alice Smith');

-- Payroll for Bob (Contractor, Hourly) for October 2023
INSERT INTO PayrollCalculations (employee_id, pay_period_start_date, pay_period_end_date, working_hours, hourly_rate, base_pay, tax_deductions, net_pay, payment_date, notes)
VALUES
(2, '2023-10-01', '2023-10-31', 120.00, 75.00, 9000.00, 900.00, 8100.00, '2023-11-05', 'October invoice for Bob Johnson, 120 hours @ $75/hr');

-- Payroll for Carol (Salaried with Bonus) for October 2023
INSERT INTO PayrollCalculations (employee_id, pay_period_start_date, pay_period_end_date, monthly_salary, base_pay, bonus_amount, tax_deductions, benefits_deductions, net_pay, payment_date, notes)
VALUES
(3, '2023-10-01', '2023-10-31', 4500.00, 4500.00, 500.00, 1150.00, 250.00, 3600.00, '2023-10-31', 'October salary and performance bonus for Carol Williams');

-- Payroll for Alice (Salaried) for November 2023
INSERT INTO PayrollCalculations (employee_id, pay_period_start_date, pay_period_end_date, monthly_salary, base_pay, tax_deductions, benefits_deductions, net_pay, payment_date, notes)
VALUES
(1, '2023-11-01', '2023-11-30', 5000.00, 5000.00, 1200.00, 300.00, 3500.00, '2023-11-30', 'November salary for Alice Smith');

-- Payroll for Bob (Contractor, Hourly) for November 2023 - different hours
INSERT INTO PayrollCalculations (employee_id, pay_period_start_date, pay_period_end_date, working_hours, hourly_rate, base_pay, tax_deductions, net_pay, payment_date, notes)
VALUES
(2, '2023-11-01', '2023-11-30', 100.00, 75.00, 7500.00, 750.00, 6750.00, '2023-12-05', 'November invoice for Bob Johnson, 100 hours @ $75/hr');
