-- ============================================================
-- Bursary Module Migration
-- Adds bursary tables to existing ward_management database
-- ============================================================

-- ------------------------------------------------------------
-- bursary_applications: Bursary application records
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bursary_applications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  application_number VARCHAR(30) NOT NULL UNIQUE,
  citizen_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  ward VARCHAR(100) NOT NULL,
  -- Applicant Information
  full_name VARCHAR(255) NOT NULL,
  national_id VARCHAR(50) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender ENUM('Male', 'Female', 'Other') NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  email VARCHAR(255) DEFAULT NULL,
  residential_address VARCHAR(255) DEFAULT NULL,
  county VARCHAR(100) DEFAULT NULL,
  constituency VARCHAR(100) DEFAULT NULL,
  -- Education Information
  institution_name VARCHAR(255) NOT NULL,
  institution_type ENUM('Secondary School', 'College', 'University', 'TVET', 'Other') NOT NULL,
  course_or_form VARCHAR(255) DEFAULT NULL,
  year_of_study VARCHAR(50) DEFAULT NULL,
  admission_number VARCHAR(100) DEFAULT NULL,
  academic_year VARCHAR(20) NOT NULL,
  student_registration_number VARCHAR(100) DEFAULT NULL,
  -- Parent / Guardian Information
  parent_full_name VARCHAR(255) NOT NULL,
  parent_relationship VARCHAR(100) NOT NULL,
  parent_phone VARCHAR(20) NOT NULL,
  parent_occupation VARCHAR(100) DEFAULT NULL,
  number_of_dependants INT DEFAULT 0,
  household_monthly_income DECIMAL(12,2) DEFAULT 0,
  -- Financial Information
  total_fees DECIMAL(12,2) NOT NULL DEFAULT 0,
  amount_paid DECIMAL(12,2) NOT NULL DEFAULT 0,
  outstanding_balance DECIMAL(12,2) NOT NULL DEFAULT 0,
  amount_requested DECIMAL(12,2) NOT NULL DEFAULT 0,
  approved_amount DECIMAL(12,2) DEFAULT 0,
  previous_bursary_received ENUM('Yes', 'No') DEFAULT 'No',
  previous_bursary_amount DECIMAL(12,2) DEFAULT 0,
  other_financial_assistance TEXT DEFAULT NULL,
  reason_for_application TEXT NOT NULL,
  -- Status & Review
  status ENUM('Draft', 'Submitted', 'Under_Review', 'Verified', 'Approved', 'Rejected', 'Disbursed') NOT NULL DEFAULT 'Draft',
  rejection_reason TEXT DEFAULT NULL,
  review_comments TEXT DEFAULT NULL,
  reviewed_by BIGINT UNSIGNED DEFAULT NULL,
  reviewed_at DATETIME DEFAULT NULL,
  verified_at DATETIME DEFAULT NULL,
  approved_at DATETIME DEFAULT NULL,
  disbursed_at DATETIME DEFAULT NULL,
  -- Timestamps
  submitted_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_bursary_citizen (citizen_id),
  KEY idx_bursary_user (user_id),
  KEY idx_bursary_ward (ward),
  KEY idx_bursary_status (status),
  KEY idx_bursary_academic_year (academic_year),
  KEY idx_bursary_created (created_at),
  KEY idx_bursary_number (application_number)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- bursary_application_documents: Supporting documents
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bursary_application_documents (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  application_id BIGINT UNSIGNED NOT NULL,
  document_type ENUM('National_ID', 'Birth_Certificate', 'Admission_Letter', 'Fee_Structure', 'Academic_Results', 'Parent_ID', 'Other') NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  secure_url VARCHAR(500) NOT NULL,
  public_id VARCHAR(255) NOT NULL,
  file_type VARCHAR(100) DEFAULT NULL,
  file_size BIGINT DEFAULT NULL,
  uploaded_by BIGINT UNSIGNED DEFAULT NULL,
  uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_bursary_doc_application (application_id),
  KEY idx_bursary_doc_type (document_type)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- bursary_application_history: Status change history
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bursary_application_history (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  application_id BIGINT UNSIGNED NOT NULL,
  action VARCHAR(255) NOT NULL,
  previous_status VARCHAR(50) DEFAULT NULL,
  new_status VARCHAR(50) DEFAULT NULL,
  performed_by BIGINT UNSIGNED DEFAULT NULL,
  performed_by_name VARCHAR(200) DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_bursary_history_application (application_id),
  KEY idx_bursary_history_created (created_at)
) ENGINE=InnoDB;
