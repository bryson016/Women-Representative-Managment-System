-- ============================================================
-- Payments & Disbursements Module Migration
-- Adds payment tables to existing ward_management database
-- ============================================================

-- ------------------------------------------------------------
-- bursary_payments: Main payment records
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bursary_payments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  payment_code VARCHAR(30) NOT NULL UNIQUE,
  application_id BIGINT UNSIGNED NOT NULL,
  beneficiary_id BIGINT UNSIGNED NOT NULL,
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
  status ENUM('Pending', 'Processing', 'Completed', 'Failed', 'Rejected', 'Reversed') NOT NULL DEFAULT 'Pending',
  failure_reason TEXT DEFAULT NULL,
  rejection_reason TEXT DEFAULT NULL,
  -- People
  initiated_by BIGINT UNSIGNED DEFAULT NULL,
  approved_by BIGINT UNSIGNED DEFAULT NULL,
  processed_by BIGINT UNSIGNED DEFAULT NULL,
  initiated_by_name VARCHAR(200) DEFAULT NULL,
  approved_by_name VARCHAR(200) DEFAULT NULL,
  processed_by_name VARCHAR(200) DEFAULT NULL,
  -- Dates
  approved_at DATETIME DEFAULT NULL,
  processed_at DATETIME DEFAULT NULL,
  completed_at DATETIME DEFAULT NULL,
  failed_at DATETIME DEFAULT NULL,
  reversed_at DATETIME DEFAULT NULL,
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_payments_application (application_id),
  KEY idx_payments_beneficiary (beneficiary_id),
  KEY idx_payments_program (program_id),
  KEY idx_payments_status (status),
  KEY idx_payments_method (payment_method),
  KEY idx_payments_created (created_at),
  KEY idx_payments_reference (transaction_reference),
  CONSTRAINT fk_payment_application
    FOREIGN KEY (application_id) REFERENCES bursary_applications (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_payment_beneficiary
    FOREIGN KEY (beneficiary_id) REFERENCES citizens (id)
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
  performed_by BIGINT UNSIGNED DEFAULT NULL,
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
-- bursary_payment_receipts: Generated receipts
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bursary_payment_receipts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  payment_id BIGINT UNSIGNED NOT NULL,
  receipt_number VARCHAR(50) NOT NULL UNIQUE,
  receipt_data JSON NOT NULL,
  generated_by BIGINT UNSIGNED DEFAULT NULL,
  generated_by_name VARCHAR(200) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_receipt_payment (payment_id),
  KEY idx_receipt_number (receipt_number),
  CONSTRAINT fk_receipt_payment
    FOREIGN KEY (payment_id) REFERENCES bursary_payments (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_receipt_generated_by
    FOREIGN KEY (generated_by) REFERENCES users (id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- bursary_bulk_disbursements: Bulk disbursement batches
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bursary_bulk_disbursements (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  batch_code VARCHAR(30) NOT NULL UNIQUE,
  total_payments INT NOT NULL DEFAULT 0,
  total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  successful_count INT NOT NULL DEFAULT 0,
  failed_count INT NOT NULL DEFAULT 0,
  pending_count INT NOT NULL DEFAULT 0,
  status ENUM('Draft', 'Submitted', 'Approved', 'Processing', 'Completed', 'Failed', 'Cancelled') NOT NULL DEFAULT 'Draft',
  initiated_by BIGINT UNSIGNED DEFAULT NULL,
  approved_by BIGINT UNSIGNED DEFAULT NULL,
  processed_by BIGINT UNSIGNED DEFAULT NULL,
  initiated_by_name VARCHAR(200) DEFAULT NULL,
  approved_by_name VARCHAR(200) DEFAULT NULL,
  processed_by_name VARCHAR(200) DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  approved_at DATETIME DEFAULT NULL,
  processed_at DATETIME DEFAULT NULL,
  completed_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_bulk_status (status),
  KEY idx_bulk_created (created_at),
  CONSTRAINT fk_bulk_initiated_by
    FOREIGN KEY (initiated_by) REFERENCES users (id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_bulk_approved_by
    FOREIGN KEY (approved_by) REFERENCES users (id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_bulk_processed_by
    FOREIGN KEY (processed_by) REFERENCES users (id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- bursary_bulk_disbursement_items: Individual payments in a bulk batch
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bursary_bulk_disbursement_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  bulk_id BIGINT UNSIGNED NOT NULL,
  payment_id BIGINT UNSIGNED DEFAULT NULL,
  application_id BIGINT UNSIGNED NOT NULL,
  beneficiary_id BIGINT UNSIGNED NOT NULL,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  payment_method ENUM('M-Pesa', 'Bank_Transfer', 'Cheque') NOT NULL DEFAULT 'M-Pesa',
  status ENUM('Pending', 'Processing', 'Completed', 'Failed', 'Rejected') NOT NULL DEFAULT 'Pending',
  failure_reason TEXT DEFAULT NULL,
  transaction_reference VARCHAR(100) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_bulk_item_bulk (bulk_id),
  KEY idx_bulk_item_payment (payment_id),
  KEY idx_bulk_item_application (application_id),
  CONSTRAINT fk_bulk_item_bulk
    FOREIGN KEY (bulk_id) REFERENCES bursary_bulk_disbursements (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_bulk_item_payment
    FOREIGN KEY (payment_id) REFERENCES bursary_payments (id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_bulk_item_application
    FOREIGN KEY (application_id) REFERENCES bursary_applications (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_bulk_item_beneficiary
    FOREIGN KEY (beneficiary_id) REFERENCES citizens (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- bursary_reconciliation: Payment reconciliation records
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bursary_reconciliation (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  reconciliation_code VARCHAR(30) NOT NULL UNIQUE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  payment_method ENUM('M-Pesa', 'Bank_Transfer', 'Cheque', 'All') NOT NULL DEFAULT 'All',
  -- Expected
  expected_count INT NOT NULL DEFAULT 0,
  expected_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  -- Processed
  processed_count INT NOT NULL DEFAULT 0,
  processed_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  -- Matched
  matched_count INT NOT NULL DEFAULT 0,
  matched_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  -- Unmatched
  unmatched_count INT NOT NULL DEFAULT 0,
  unmatched_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  -- Failed
  failed_count INT NOT NULL DEFAULT 0,
  failed_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  -- Duplicate
  duplicate_count INT NOT NULL DEFAULT 0,
  duplicate_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  -- Status
  status ENUM('In_Progress', 'Completed', 'Flagged') NOT NULL DEFAULT 'In_Progress',
  notes TEXT DEFAULT NULL,
  performed_by BIGINT UNSIGNED DEFAULT NULL,
  performed_by_name VARCHAR(200) DEFAULT NULL,
  completed_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_reconciliation_period (period_start, period_end),
  KEY idx_reconciliation_status (status),
  CONSTRAINT fk_reconciliation_performed_by
    FOREIGN KEY (performed_by) REFERENCES users (id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- bursary_reconciliation_items: Individual reconciliation items
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bursary_reconciliation_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  reconciliation_id BIGINT UNSIGNED NOT NULL,
  payment_id BIGINT UNSIGNED DEFAULT NULL,
  transaction_reference VARCHAR(100) NOT NULL,
  expected_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  actual_amount DECIMAL(12,2) DEFAULT NULL,
  status ENUM('Matched', 'Unmatched', 'Failed', 'Duplicate', 'Missing_Reference') NOT NULL DEFAULT 'Unmatched',
  notes TEXT DEFAULT NULL,
  is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
  resolved_by BIGINT UNSIGNED DEFAULT NULL,
  resolved_by_name VARCHAR(200) DEFAULT NULL,
  resolved_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_recon_item_reconciliation (reconciliation_id),
  KEY idx_recon_item_payment (payment_id),
  KEY idx_recon_item_status (status),
  CONSTRAINT fk_recon_item_reconciliation
    FOREIGN KEY (reconciliation_id) REFERENCES bursary_reconciliation (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_recon_item_payment
    FOREIGN KEY (payment_id) REFERENCES bursary_payments (id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_recon_item_resolved_by
    FOREIGN KEY (resolved_by) REFERENCES users (id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- bursary_payment_reports: Generated payment reports
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bursary_payment_reports (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  report_code VARCHAR(30) NOT NULL UNIQUE,
  report_name VARCHAR(255) NOT NULL,
  report_type ENUM('Summary', 'Detailed', 'By_Ward', 'By_Program', 'By_Method', 'By_Status', 'By_Beneficiary') NOT NULL DEFAULT 'Summary',
  report_format ENUM('PDF', 'Excel', 'CSV', 'HTML') NOT NULL DEFAULT 'PDF',
  parameters JSON DEFAULT NULL,
  file_path VARCHAR(500) DEFAULT NULL,
  generated_by BIGINT UNSIGNED DEFAULT NULL,
  generated_by_name VARCHAR(200) DEFAULT NULL,
  generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_payment_reports_type (report_type),
  KEY idx_payment_reports_generated (generated_at),
  CONSTRAINT fk_payment_report_generated_by
    FOREIGN KEY (generated_by) REFERENCES users (id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;
