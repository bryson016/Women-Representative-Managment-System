-- ============================================================
-- Ward Management System - MySQL Database Schema
-- ============================================================
-- This schema defines all tables for the Ward Management System
-- including Users, Citizens, Complaints, Projects, Meetings,
-- Staff, Budget, and Reports modules.
-- ============================================================

CREATE DATABASE IF NOT EXISTS ward_management
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ward_management;

-- ============================================================
-- 1. CORE TABLES
-- ============================================================

-- ------------------------------------------------------------
-- users: Authentication accounts for the system
-- Matches the existing authService.js queries
-- ------------------------------------------------------------
CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  username VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) DEFAULT NULL,
  role ENUM('admin', 'officer', 'staff', 'citizen') NOT NULL DEFAULT 'citizen',
  ward VARCHAR(100) DEFAULT NULL,
  email VARCHAR(255) DEFAULT NULL,
  phone_number VARCHAR(20) DEFAULT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_username (username),
  KEY idx_users_role (role),
  KEY idx_users_ward (ward)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- villages: Lookup table for ward villages
-- ------------------------------------------------------------
CREATE TABLE villages (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  ward VARCHAR(100) NOT NULL,
  sub_location VARCHAR(100) DEFAULT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_villages_name_ward (name, ward)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- citizens: Registered ward residents
-- ------------------------------------------------------------
CREATE TABLE citizens (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  national_id VARCHAR(50) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  gender ENUM('Male', 'Female', 'Other') NOT NULL,
  date_of_birth DATE NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  email VARCHAR(255) DEFAULT NULL,
  occupation VARCHAR(100) DEFAULT NULL,
  village VARCHAR(100) NOT NULL,
  sub_location VARCHAR(100) DEFAULT NULL,
  ward VARCHAR(100) NOT NULL,
  physical_address VARCHAR(255) DEFAULT NULL,
  emergency_contact VARCHAR(20) DEFAULT NULL,
  photo_url VARCHAR(500) DEFAULT NULL,
  status ENUM('Active', 'Inactive', 'Suspended') NOT NULL DEFAULT 'Active',
  registration_date DATE NOT NULL,
  user_id BIGINT UNSIGNED DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_citizens_national_id (national_id),
  UNIQUE KEY uq_citizens_user_id (user_id),
  KEY idx_citizens_village (village),
  KEY idx_citizens_ward (ward),
  KEY idx_citizens_status (status),
  KEY idx_citizens_name (last_name, first_name),
  CONSTRAINT fk_citizens_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- staff: Ward staff members
-- ------------------------------------------------------------
CREATE TABLE staff (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED DEFAULT NULL,
  employee_no VARCHAR(50) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  title VARCHAR(100) DEFAULT NULL,
  department VARCHAR(100) DEFAULT NULL,
  role VARCHAR(100) DEFAULT NULL,
  phone_number VARCHAR(20) DEFAULT NULL,
  email VARCHAR(255) DEFAULT NULL,
  ward VARCHAR(100) DEFAULT NULL,
  employment_date DATE DEFAULT NULL,
  status ENUM('Active', 'On Leave', 'Inactive') NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_staff_employee_no (employee_no),
  UNIQUE KEY uq_staff_user_id (user_id),
  KEY idx_staff_department (department),
  KEY idx_staff_status (status),
  CONSTRAINT fk_staff_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 2. COMPLAINTS MODULE
-- ============================================================

-- ------------------------------------------------------------
-- complaints: Public service complaints
-- ------------------------------------------------------------
CREATE TABLE complaints (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  complaint_code VARCHAR(30) NOT NULL,
  citizen_id BIGINT UNSIGNED DEFAULT NULL,
  citizen_name VARCHAR(200) NOT NULL,
  national_id VARCHAR(50) DEFAULT NULL,
  phone_number VARCHAR(20) DEFAULT NULL,
  category ENUM('Sanitation', 'Road Repair', 'Water Supply', 'Street Lighting', 'Waste Management', 'Health Services', 'Education', 'Security', 'Other') NOT NULL,
  priority ENUM('Low', 'Medium', 'High', 'Urgent') NOT NULL DEFAULT 'Medium',
  status ENUM('Open', 'Assigned', 'In Progress', 'Resolved', 'Closed') NOT NULL DEFAULT 'Open',
  village VARCHAR(100) NOT NULL,
  assigned_officer_id BIGINT UNSIGNED DEFAULT NULL,
  description TEXT NOT NULL,
  officer_notes TEXT,
  resolution_notes TEXT,
  date_reported DATE NOT NULL,
  last_updated DATE NOT NULL,
  resolved_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_complaints_code (complaint_code),
  KEY idx_complaints_category (category),
  KEY idx_complaints_status (status),
  KEY idx_complaints_priority (priority),
  KEY idx_complaints_village (village),
  KEY idx_complaints_date (date_reported),
  KEY idx_complaints_citizen (citizen_id),
  KEY idx_complaints_officer (assigned_officer_id),
  CONSTRAINT fk_complaints_citizen
    FOREIGN KEY (citizen_id) REFERENCES citizens (id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_complaints_officer
    FOREIGN KEY (assigned_officer_id) REFERENCES staff (id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- complaint_communications: Communication/activity history
-- ------------------------------------------------------------
CREATE TABLE complaint_communications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  complaint_id BIGINT UNSIGNED NOT NULL,
  date DATE NOT NULL,
  action VARCHAR(255) NOT NULL,
  performed_by VARCHAR(200) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_comm_complaint (complaint_id),
  KEY idx_comm_date (date),
  CONSTRAINT fk_comm_complaint
    FOREIGN KEY (complaint_id) REFERENCES complaints (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- complaint_attachments: Evidence images and attachments
-- ------------------------------------------------------------
CREATE TABLE complaint_attachments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  complaint_id BIGINT UNSIGNED NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(50) DEFAULT NULL,
  file_size BIGINT DEFAULT NULL,
  uploaded_by BIGINT UNSIGNED DEFAULT NULL,
  uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_att_complaint (complaint_id),
  CONSTRAINT fk_att_complaint
    FOREIGN KEY (complaint_id) REFERENCES complaints (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 3. PROJECTS MODULE
-- ============================================================

-- ------------------------------------------------------------
-- projects: Development projects
-- ------------------------------------------------------------
CREATE TABLE projects (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  project_code VARCHAR(30) NOT NULL,
  project_name VARCHAR(255) NOT NULL,
  category ENUM('Roads & Transport', 'Water & Sanitation', 'Health Services', 'Education Support', 'Public Markets', 'Street Lighting', 'Drainage & Flood Control', 'Community Facilities') NOT NULL,
  ward VARCHAR(100) NOT NULL,
  location VARCHAR(255) DEFAULT NULL,
  village VARCHAR(100) DEFAULT NULL,
  description TEXT,
  contractor_id BIGINT UNSIGNED DEFAULT NULL,
  contractor_name VARCHAR(200) DEFAULT NULL,
  budget DECIMAL(15, 2) NOT NULL DEFAULT 0,
  amount_spent DECIMAL(15, 2) NOT NULL DEFAULT 0,
  funding_source VARCHAR(100) DEFAULT NULL,
  start_date DATE DEFAULT NULL,
  expected_completion DATE DEFAULT NULL,
  priority ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL DEFAULT 'Medium',
  project_manager_id BIGINT UNSIGNED DEFAULT NULL,
  project_manager_name VARCHAR(200) DEFAULT NULL,
  status ENUM('Planning', 'Approved', 'Ongoing', 'Delayed', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Planning',
  progress TINYINT UNSIGNED NOT NULL DEFAULT 0,
  financial_year VARCHAR(20) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_projects_code (project_code),
  KEY idx_projects_category (category),
  KEY idx_projects_status (status),
  KEY idx_projects_priority (priority),
  KEY idx_projects_ward (ward),
  KEY idx_projects_contractor (contractor_id),
  KEY idx_projects_manager (project_manager_id),
  CONSTRAINT fk_projects_contractor
    FOREIGN KEY (contractor_id) REFERENCES staff (id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_projects_manager
    FOREIGN KEY (project_manager_id) REFERENCES staff (id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- project_milestones: Project milestones
-- ------------------------------------------------------------
CREATE TABLE project_milestones (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  project_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  due_date DATE NOT NULL,
  status ENUM('Pending', 'Ongoing', 'Completed', 'Delayed', 'Cancelled', 'On Track') NOT NULL DEFAULT 'Pending',
  completed_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_milestone_project (project_id),
  KEY idx_milestone_status (status),
  CONSTRAINT fk_milestone_project
    FOREIGN KEY (project_id) REFERENCES projects (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- project_updates: Progress updates
-- ------------------------------------------------------------
CREATE TABLE project_updates (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  project_id BIGINT UNSIGNED NOT NULL,
  date DATE NOT NULL,
  update_text TEXT NOT NULL,
  updated_by VARCHAR(200) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_update_project (project_id),
  KEY idx_update_date (date),
  CONSTRAINT fk_update_project
    FOREIGN KEY (project_id) REFERENCES projects (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- project_budget_updates: Budget utilization records
-- ------------------------------------------------------------
CREATE TABLE project_budget_updates (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  project_id BIGINT UNSIGNED NOT NULL,
  date DATE NOT NULL,
  item VARCHAR(255) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  type ENUM('utilized', 'returned', 'allocated') NOT NULL DEFAULT 'utilized',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_budget_project (project_id),
  KEY idx_budget_date (date),
  CONSTRAINT fk_budget_project
    FOREIGN KEY (project_id) REFERENCES projects (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- project_documents: Project documents
-- ------------------------------------------------------------
CREATE TABLE project_documents (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  project_id BIGINT UNSIGNED NOT NULL,
  document_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) DEFAULT NULL,
  file_type VARCHAR(50) DEFAULT NULL,
  uploaded_by BIGINT UNSIGNED DEFAULT NULL,
  uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_doc_project (project_id),
  CONSTRAINT fk_doc_project
    FOREIGN KEY (project_id) REFERENCES projects (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- project_activities: Activity timeline
-- ------------------------------------------------------------
CREATE TABLE project_activities (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  project_id BIGINT UNSIGNED NOT NULL,
  date DATE NOT NULL,
  action VARCHAR(255) NOT NULL,
  performed_by VARCHAR(200) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_activity_project (project_id),
  KEY idx_activity_date (date),
  CONSTRAINT fk_activity_project
    FOREIGN KEY (project_id) REFERENCES projects (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- project_comments: Comments on projects
-- ------------------------------------------------------------
CREATE TABLE project_comments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  project_id BIGINT UNSIGNED NOT NULL,
  author VARCHAR(200) NOT NULL,
  date DATE NOT NULL,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_comment_project (project_id),
  KEY idx_comment_date (date),
  CONSTRAINT fk_comment_project
    FOREIGN KEY (project_id) REFERENCES projects (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 4. MEETINGS MODULE
-- ============================================================

-- ------------------------------------------------------------
-- meetings: Ward meetings
-- ------------------------------------------------------------
CREATE TABLE meetings (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  meeting_code VARCHAR(30) NOT NULL,
  title VARCHAR(255) NOT NULL,
  type ENUM('Ward Development Committee', 'Public Baraza', 'Budget Review', 'Planning Session', 'Town Hall', 'Project Steering Committee', 'Health & Sanitation Forum', 'Education Committee', 'Security Committee', 'Water & Environment Committee') NOT NULL,
  priority ENUM('Low', 'Medium', 'High', 'Urgent') NOT NULL DEFAULT 'Medium',
  status ENUM('Scheduled', 'In Progress', 'Completed', 'Postponed', 'Cancelled') NOT NULL DEFAULT 'Scheduled',
  date DATE NOT NULL,
  time TIME NOT NULL,
  end_time TIME NOT NULL,
  venue VARCHAR(255) NOT NULL,
  village VARCHAR(100) DEFAULT NULL,
  chairperson VARCHAR(200) DEFAULT NULL,
  secretary VARCHAR(200) DEFAULT NULL,
  organizer VARCHAR(200) DEFAULT NULL,
  expected_attendance INT UNSIGNED NOT NULL DEFAULT 0,
  actual_attendance INT UNSIGNED NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_meetings_code (meeting_code),
  KEY idx_meetings_type (type),
  KEY idx_meetings_status (status),
  KEY idx_meetings_date (date),
  KEY idx_meetings_village (village)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- meeting_agenda: Agenda items
-- ------------------------------------------------------------
CREATE TABLE meeting_agenda (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  meeting_id BIGINT UNSIGNED NOT NULL,
  item_order INT NOT NULL DEFAULT 0,
  item VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_agenda_meeting (meeting_id),
  CONSTRAINT fk_agenda_meeting
    FOREIGN KEY (meeting_id) REFERENCES meetings (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- meeting_minutes: Minutes of meetings
-- ------------------------------------------------------------
CREATE TABLE meeting_minutes (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  meeting_id BIGINT UNSIGNED NOT NULL,
  item_order INT NOT NULL DEFAULT 0,
  minute_text TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_minutes_meeting (meeting_id),
  CONSTRAINT fk_minutes_meeting
    FOREIGN KEY (meeting_id) REFERENCES meetings (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- meeting_action_items: Action items from meetings
-- ------------------------------------------------------------
CREATE TABLE meeting_action_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  meeting_id BIGINT UNSIGNED NOT NULL,
  item VARCHAR(255) NOT NULL,
  owner VARCHAR(200) NOT NULL,
  due_date DATE NOT NULL,
  status ENUM('Pending', 'In Progress', 'Completed', 'Overdue') NOT NULL DEFAULT 'Pending',
  completed_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_action_meeting (meeting_id),
  KEY idx_action_status (status),
  KEY idx_action_due (due_date),
  CONSTRAINT fk_action_meeting
    FOREIGN KEY (meeting_id) REFERENCES meetings (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- meeting_attendance: Attendance records
-- ------------------------------------------------------------
CREATE TABLE meeting_attendance (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  meeting_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(200) NOT NULL,
  role VARCHAR(100) DEFAULT NULL,
  present BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_attendance_meeting (meeting_id),
  CONSTRAINT fk_attendance_meeting
    FOREIGN KEY (meeting_id) REFERENCES meetings (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- meeting_activities: Activity timeline
-- ------------------------------------------------------------
CREATE TABLE meeting_activities (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  meeting_id BIGINT UNSIGNED NOT NULL,
  date DATE NOT NULL,
  action VARCHAR(255) NOT NULL,
  performed_by VARCHAR(200) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_meeting_activity (meeting_id),
  KEY idx_meeting_activity_date (date),
  CONSTRAINT fk_meeting_activity
    FOREIGN KEY (meeting_id) REFERENCES meetings (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 5. BUDGET & REPORTS MODULE
-- ============================================================

-- ------------------------------------------------------------
-- ward_budget: Ward budget allocations by financial year
-- ------------------------------------------------------------
CREATE TABLE ward_budget (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  financial_year VARCHAR(20) NOT NULL,
  category VARCHAR(100) NOT NULL,
  allocated_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  spent_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  project_id BIGINT UNSIGNED DEFAULT NULL,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_budget_year (financial_year),
  KEY idx_budget_category (category),
  KEY idx_budget_project (project_id),
  CONSTRAINT fk_budget_project_ref
    FOREIGN KEY (project_id) REFERENCES projects (id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- reports: Generated reports
-- ------------------------------------------------------------
CREATE TABLE reports (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  report_name VARCHAR(255) NOT NULL,
  report_type ENUM('Citizens', 'Complaints', 'Projects', 'Meetings', 'Budget', 'Staff', 'Custom') NOT NULL,
  report_format ENUM('PDF', 'Excel', 'CSV', 'HTML') NOT NULL DEFAULT 'PDF',
  parameters TEXT,
  generated_by BIGINT UNSIGNED DEFAULT NULL,
  file_path VARCHAR(500) DEFAULT NULL,
  generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_reports_type (report_type),
  KEY idx_reports_generated (generated_at),
  KEY idx_reports_by (generated_by),
  CONSTRAINT fk_reports_user
    FOREIGN KEY (generated_by) REFERENCES users (id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- system_settings: Key-value store for application settings
-- ------------------------------------------------------------
CREATE TABLE system_settings (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  setting_type VARCHAR(50) NOT NULL DEFAULT 'text',
  description VARCHAR(255) DEFAULT NULL,
  is_editable BOOLEAN NOT NULL DEFAULT TRUE,
  updated_by BIGINT UNSIGNED DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_settings_key (setting_key),
  CONSTRAINT fk_settings_user
    FOREIGN KEY (updated_by) REFERENCES users (id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- system_activities: Audit log for system activities
-- ------------------------------------------------------------
CREATE TABLE system_activities (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  activity VARCHAR(255) NOT NULL,
  user_id BIGINT UNSIGNED DEFAULT NULL,
  user_name VARCHAR(200) NOT NULL,
  details TEXT NOT NULL,
  ip_address VARCHAR(50) DEFAULT NULL,
  user_agent VARCHAR(500) DEFAULT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Success',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_activity_user (user_id),
  KEY idx_activity_type (activity),
  KEY idx_activity_date (created_at),
  CONSTRAINT fk_activity_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- media: Cloudinary media uploads tracking
-- ------------------------------------------------------------
CREATE TABLE media (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  public_id VARCHAR(255) NOT NULL,
  url VARCHAR(500) NOT NULL,
  secure_url VARCHAR(500) NOT NULL,
  format VARCHAR(50) DEFAULT NULL,
  resource_type VARCHAR(50) DEFAULT NULL,
  width INT DEFAULT NULL,
  height INT DEFAULT NULL,
  bytes BIGINT DEFAULT NULL,
  original_name VARCHAR(255) DEFAULT NULL,
  mime_type VARCHAR(100) DEFAULT NULL,
  uploaded_by BIGINT UNSIGNED DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_media_public_id (public_id),
  KEY idx_media_uploaded_by (uploaded_by),
  KEY idx_media_created_at (created_at),
  CONSTRAINT fk_media_uploaded_by
    FOREIGN KEY (uploaded_by) REFERENCES users (id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 6. SEED DATA
-- ============================================================

-- Seed villages
INSERT INTO villages (name, ward, sub_location) VALUES
  ('Kangemi', 'Westlands', 'Kangemi Central'),
  ('Westlands Central', 'Westlands', 'Westlands'),
  ('Kitisuru', 'Westlands', 'Kitisuru East'),
  ('Parklands', 'Westlands', 'Parklands Estate'),
  ('Mountain View', 'Westlands', 'Mountain View Estate');

-- Seed initial admin user
INSERT INTO users (full_name, username, password_hash, role, ward, email)
VALUES (
  'System Administrator',
  'admin',
  NULL,
  'admin',
  'Westlands',
  'admin@ward.gov.ke'
);

-- Seed default system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description) VALUES
  ('ward_name', 'Kiambu Ward', 'text', 'Name of the ward'),
  ('ward_code', 'KBW-001', 'text', 'Unique ward code'),
  ('county', 'Kiambu County', 'text', 'County name'),
  ('system_name', 'Ward Management System', 'text', 'System display name'),
  ('financial_year', '2026/2027', 'text', 'Current financial year'),
  ('time_zone', 'Africa/Nairobi (EAT)', 'text', 'System time zone'),
  ('email', 'info@kiambuward.go.ke', 'email', 'Ward office email'),
  ('phone', '+254 712 345 678', 'tel', 'Ward office phone'),
  ('office_address', 'Kiambu, Kenya', 'text', 'Ward office address');

-- ============================================================
-- 7. BURSARY MODULE
-- ============================================================

-- ------------------------------------------------------------
-- bursary_applications: Bursary application records
-- ------------------------------------------------------------
CREATE TABLE bursary_applications (
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
  KEY idx_bursary_number (application_number),
  CONSTRAINT fk_bursary_citizen
    FOREIGN KEY (citizen_id) REFERENCES citizens (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_bursary_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_bursary_reviewer
    FOREIGN KEY (reviewed_by) REFERENCES users (id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- bursary_application_documents: Supporting documents
-- ------------------------------------------------------------
CREATE TABLE bursary_application_documents (
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
  KEY idx_bursary_doc_type (document_type),
  CONSTRAINT fk_bursary_doc_application
    FOREIGN KEY (application_id) REFERENCES bursary_applications (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_bursary_doc_uploader
    FOREIGN KEY (uploaded_by) REFERENCES users (id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- bursary_application_history: Status change history
-- ------------------------------------------------------------
CREATE TABLE bursary_application_history (
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
  KEY idx_bursary_history_created (created_at),
  CONSTRAINT fk_bursary_history_application
    FOREIGN KEY (application_id) REFERENCES bursary_applications (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_bursary_history_user
    FOREIGN KEY (performed_by) REFERENCES users (id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Seed initial system activities
INSERT INTO system_activities (activity, user_id, user_name, details, status) VALUES
  ('User Login', 1, 'System Administrator', 'Admin login from 192.168.1.1', 'Success'),
  ('Settings Changed', 1, 'System Administrator', 'Initial system configuration completed', 'Success'),
  ('Database Backup', 1, 'System Administrator', 'Automated database backup completed', 'Success');
