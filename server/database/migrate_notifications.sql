-- ============================================================
-- Notifications Table Migration
-- ============================================================
-- This table stores notifications for both citizens and administrators.
-- ============================================================

CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED DEFAULT NULL,
  type ENUM(
    'Complaint_Update',
    'Complaint_Submitted',
    'Application_Submitted',
    'Application_Update',
    'Request_Submitted',
    'Request_Update',
    'Citizen_Registered',
    'System_Alert',
    'General'
  ) NOT NULL DEFAULT 'General',
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  related_id BIGINT UNSIGNED DEFAULT NULL,
  related_type ENUM('complaint', 'application', 'request', 'citizen', 'system') DEFAULT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_notifications_user (user_id),
  KEY idx_notifications_type (type),
  KEY idx_notifications_read (is_read),
  KEY idx_notifications_created (created_at),
  KEY idx_notifications_related (related_id, related_type),
  CONSTRAINT fk_notifications_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;
