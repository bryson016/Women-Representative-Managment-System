-- ============================================================
-- Bursary Module Enhancements Migration
-- Adds bursary programs, beneficiaries, and payments tables
-- ============================================================

-- ------------------------------------------------------------
-- bursary_programs: Bursary program definitions
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bursary_programs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  program_code VARCHAR(30) NOT NULL UNIQUE,
  program_name VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL,
  institution_type ENUM('Secondary School', 'College', 'University', 'TVET', 'Other', 'All') DEFAULT 'All',
  max_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  min_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_budget DECIMAL(12,2) NOT NULL DEFAULT 0,
  allocated_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  disbursed_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  application_start_date DATE DEFAULT NULL,
  application_end_date DATE DEFAULT NULL,
  academic_year VARCHAR(20) DEFAULT NULL,
  ward VARCHAR(100) DEFAULT NULL,
  requirements TEXT DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_by BIGINT UNSIGNED DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_bursary_programs_active (is_active),
  KEY idx_bursary_programs_year (academic_year),
  KEY idx_bursary_programs_ward (ward)
) ENGINE=InnoDB;