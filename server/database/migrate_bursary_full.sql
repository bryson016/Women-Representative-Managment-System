-- ============================================================
-- Full Bursary Module Migration
-- Adds beneficiaries, payments, audit logs and updates roles
-- ============================================================

-- ------------------------------------------------------------
-- bursary_beneficiaries: Approved bursary recipients
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bursary_beneficiaries (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  beneficiary_number VARCHAR(30) NOT NULL UNIQUE,
  application_id BIGINT UNSIGNED NOT NULL,
  citizen_id BIGINT NOT NULL,
  user_id BIGINT DEFAULT NULL,
  full_name VARCHAR(255) NOT NULL,
  national_id VARCHAR(50) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  email VARCHAR(255) DEFAULT NULL,
  ward VARCHAR(100) NOT NULL,
  county VARCHAR(100) DEFAULT NULL,
  constituency VARCHAR(100) DEFAULT NULL,
  institution_name VARCHAR(255) NOT NULL,
  institution_type ENUM('Secondary School', 'College', 'University', 'TVET', 'Other') NOT NULL,
  course_or_form VARCHAR(255) DEFAULT NULL,
  year_of_study VARCHAR(50) DEFAULT NULL,
  admission_number VARCHAR(100) DEFAULT NULL,
  academic_year VARCHAR(20) NOT NULL,
  student_registration_number VARCHAR(100) DEFAULT NULL,
  parent_full_name VARCHAR(255) DEFAULT NULL,
  parent_relationship VARCHAR(100) DEFAULT NULL,
  parent_phone VARCHAR(20) DEFAULT NULL,
  -- Financial
  total_fees DECIMAL(12,2) NOT NULL DEFAULT 0,
  amount_paid DECIMAL(12,2) NOT NULL DEFAULT 0,
  outstanding_balance DECIMAL(12,2) NOT NULL DEFAULT 0,
  amount_requested DECIMAL(12,2) NOT NULL DEFAULT 0,
  approved_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_disbursed DECIMAL(12,2) NOT NULL DEFAULT 0,
  remaining_balance DECIMAL(12,2) NOT NULL DEFAULT 0,
  -- Status
  status ENUM('Active', 'Suspended', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Active',
  -- Program
  program_id BIGINT UNSIGNED DEFAULT NULL,
  program_name VARCHAR(255) DEFAULT NULL,
  -- People
  created_by BIGINT DEFAULT NULL,
  created_by_name VARCHAR(200) DEFAULT NULL,
  approved_by BIGINT DEFAULT NULL,
  approved_by_name VARCHAR(200) DEFAULT NULL,
  -- Dates
  approved_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_beneficiary_application (application_id),
  KEY idx_beneficiary_citizen (citizen_id),
  KEY idx_beneficiary_user (user_id),
  KEY idx_beneficiary_number (beneficiary_number),
  KEY idx_beneficiary_status (status),
  KEY idx_beneficiary_ward (ward),
  KEY idx_beneficiary_academic_year (academic_year),
  KEY idx_beneficiary_program (program_id),
  CONSTRAINT fk_beneficiary_application
    FOREIGN KEY (application_id) REFERENCES bursary_applications (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_beneficiary_citizen
    FOREIGN KEY (citizen_id) REFERENCES citizens (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_beneficiary_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_beneficiary_created_by
    FOREIGN KEY (created_by) REFERENCES users (id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_beneficiary_approved_by
    FOREIGN KEY (approved_by) REFERENCES users (id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- bursary_payments: Payment/disbursement records
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bursary_payments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  payment_code VARCHAR(30) NOT NULL UNIQUE,
  beneficiary_id BIGINT UNSIGNED NOT NULL,
  application_id BIGINT UNSIGNED NOT NULL,
  program_id BIGINT UNSIGNED DEFAULT NULL,
  -- Amounts
  awarded_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  previously_paid DECIMAL(12,2) NOT NULL DEFAULT 0,
  payment_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  remaining_balance DECIMAL(12,2) NOT NULL DEFAULT 0,
  -- Payment Method
  payment_method ENUM('M-Pesa', 'Bank_Transfer', 'Cheque') NOT NULL DEFAULT 'M-Pesa',
  -- M-Pesa Details
  mpesa_number VARCHAR(20) DEFAULT NULL,
  mpesa_transaction_id VARCHAR(100) DEFAULT NULL,
  -- Bank Details
  bank_name VARCHAR(100) DEFAULT NULL,
  bank_account_number VARCHAR(50) DEFAULT NULL,
  bank_branch VARCHAR(100) DEFAULT NULL,
  -- Cheque Details
  cheque_number VARCHAR(50) DEFAULT NULL,
  cheque_date DATE DEFAULT NULL,
  -- Transaction Reference
  transaction_reference VARCHAR(100) DEFAULT NULL,
  external_reference VARCHAR(100) DEFAULT NULL,
  -- Status
  status ENUM('PENDING', 'COMPLETED', 'FAILED', 'REJECTED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
  failure_reason TEXT DEFAULT NULL,
  rejection_reason TEXT DEFAULT NULL,
  -- People
  initiated_by BIGINT DEFAULT NULL,
  approved_by BIGINT DEFAULT NULL,
  processed_by BIGINT DEFAULT NULL,
  initiated_by_name VARCHAR(200) DEFAULT NULL,
  approved_by_name VARCHAR(200) DEFAULT NULL,
  processed_by_name VARCHAR(200) DEFAULT NULL,
  -- Dates
  approved_at DATETIME DEFAULT NULL,
  processed_at DATETIME DEFAULT NULL,
  completed_at DATETIME DEFAULT NULL,
  failed_at DATETIME DEFAULT NULL,
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_payments_beneficiary (beneficiary_id),
  KEY idx_payments_application (application_id),
  KEY idx_payments_program (program_id),
  KEY idx_payments_status (status),
  KEY idx_payments_method (payment_method),
  KEY idx_payments_created (created_at),
  KEY idx_payments_reference (transaction_reference),
  CONSTRAINT fk_payment_beneficiary
    FOREIGN KEY (beneficiary_id) REFERENCES bursary_beneficiaries (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_payment_application
    FOREIGN KEY (application_id) REFERENCES bursary_applications (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_payment_program
    FOREIGN KEY (program_id) REFERENCES bursary_programs (id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_payment_initiated_by
    FOREIGN KEY (initiated_by) REFERENCES users (id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_payment_approved_by
    FOREIGN KEY (approved_by) REFERENCES users (id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_payment_processed_by
    FOREIGN KEY (processed_by) REFERENCES users (id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- bursary_payment_history: Payment status change history
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bursary_payment_history (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  payment_id BIGINT UNSIGNED NOT NULL,
  action VARCHAR(255) NOT NULL,
  previous_status VARCHAR(50) DEFAULT NULL,
  new_status VARCHAR(50) DEFAULT NULL,
  performed_by BIGINT DEFAULT NULL,
  performed_by_name VARCHAR(200) DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  ip_address VARCHAR(50) DEFAULT NULL,
  user_agent VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_payment_history_payment (payment_id),
  KEY idx_payment_history_created (created_at),
  CONSTRAINT fk_payment_history_payment
    FOREIGN KEY (payment_id) REFERENCES bursary_payments (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_payment_history_user
    FOREIGN KEY (performed_by) REFERENCES users (id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- audit_logs: System-wide audit trail
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT DEFAULT NULL,
  user_name VARCHAR(200) DEFAULT NULL,
  user_role VARCHAR(50) DEFAULT NULL,
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id BIGINT DEFAULT NULL,
  entity_name VARCHAR(255) DEFAULT NULL,
  old_values JSON DEFAULT NULL,
  new_values JSON DEFAULT NULL,
  ip_address VARCHAR(50) DEFAULT NULL,
  user_agent VARCHAR(500) DEFAULT NULL,
  status ENUM('Success', 'Failed', 'Warning') NOT NULL DEFAULT 'Success',
  error_message TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_audit_user (user_id),
  KEY idx_audit_entity (entity_type, entity_id),
  KEY idx_audit_action (action),
  KEY idx_audit_created (created_at),
  CONSTRAINT fk_audit_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- bursary_beneficiary_history: Beneficiary status change history
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bursary_beneficiary_history (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  beneficiary_id BIGINT UNSIGNED NOT NULL,
  action VARCHAR(255) NOT NULL,
  previous_status VARCHAR(50) DEFAULT NULL,
  new_status VARCHAR(50) DEFAULT NULL,
  performed_by BIGINT DEFAULT NULL,
  performed_by_name VARCHAR(200) DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_beneficiary_history_beneficiary (beneficiary_id),
  KEY idx_beneficiary_history_created (created_at),
  CONSTRAINT fk_beneficiary_history_beneficiary
    FOREIGN KEY (beneficiary_id) REFERENCES bursary_beneficiaries (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_beneficiary_history_user
    FOREIGN KEY (performed_by) REFERENCES users (id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;
