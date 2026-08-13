-- Settings Dashboard Migration
-- Run this SQL in your MySQL database to create the settings tables

CREATE TABLE IF NOT EXISTS system_settings (
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
  CONSTRAINT fk_settings_user FOREIGN KEY (updated_by) REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS system_activities (
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
  CONSTRAINT fk_activity_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS media (
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
  CONSTRAINT fk_media_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

INSERT IGNORE INTO system_settings (setting_key, setting_value, setting_type, description) VALUES
  ('ward_name', 'Kiambu Ward', 'text', 'Name of the ward'),
  ('ward_code', 'KBW-001', 'text', 'Unique ward code'),
  ('county', 'Kiambu County', 'text', 'County name'),
  ('system_name', 'Ward Management System', 'text', 'System display name'),
  ('financial_year', '2026/2027', 'text', 'Current financial year'),
  ('time_zone', 'Africa/Nairobi (EAT)', 'text', 'System time zone'),
  ('email', 'info@kiambuward.go.ke', 'email', 'Ward office email'),
  ('phone', '+254 712 345 678', 'tel', 'Ward office phone'),
  ('office_address', 'Kiambu, Kenya', 'text', 'Ward office address');

INSERT IGNORE INTO system_activities (activity, user_id, user_name, details, status) VALUES
  ('User Login', 1, 'System Administrator', 'Admin login from 192.168.1.1', 'Success'),
  ('Settings Changed', 1, 'System Administrator', 'Initial system configuration completed', 'Success'),
  ('Database Backup', 1, 'System Administrator', 'Automated database backup completed', 'Success');
