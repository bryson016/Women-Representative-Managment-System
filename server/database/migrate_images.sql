-- ============================================================
-- Image Management System - MySQL Database Migration
-- ============================================================
-- Adds tables for image management with categories.
-- ============================================================

USE ward_management;

-- ------------------------------------------------------------
-- image_categories: Categories for organizing images
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS image_categories (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT DEFAULT NULL,
  color VARCHAR(7) DEFAULT '#7c3aed',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_image_categories_slug (slug),
  KEY idx_image_categories_active (is_active)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- images: Main image management table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS images (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  image_name VARCHAR(255) NOT NULL,
  image_path VARCHAR(500) NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL,
  category_id BIGINT UNSIGNED DEFAULT NULL,
  event VARCHAR(255) DEFAULT NULL,
  project VARCHAR(255) DEFAULT NULL,
  uploaded_by BIGINT UNSIGNED DEFAULT NULL,
  file_size BIGINT DEFAULT NULL,
  file_type VARCHAR(50) DEFAULT NULL,
  width INT DEFAULT NULL,
  height INT DEFAULT NULL,
  upload_date DATE DEFAULT NULL,
  status ENUM('active', 'archived', 'deleted') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_images_category (category_id),
  KEY idx_images_uploaded_by (uploaded_by),
  KEY idx_images_event (event),
  KEY idx_images_project (project),
  KEY idx_images_upload_date (upload_date),
  KEY idx_images_status (status),
  KEY idx_images_created (created_at),
  KEY idx_images_title (title),
  CONSTRAINT fk_images_category
    FOREIGN KEY (category_id) REFERENCES image_categories (id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Seed default image categories
-- ------------------------------------------------------------
INSERT INTO image_categories (name, slug, description, color) VALUES
  ('Events', 'events', 'Ward events, meetings, and public gatherings', '#7c3aed'),
  ('Projects', 'projects', 'Development projects and infrastructure', '#2D936C'),
  ('Staff', 'staff', 'Staff photos and team images', '#C9A227'),
  ('Citizens', 'citizens', 'Citizen engagement and community activities', '#65A30D'),
  ('Documents', 'documents', 'Official documents and reports', '#2563eb'),
  ('General', 'general', 'General ward images', '#6b7280')
ON DUPLICATE KEY UPDATE name = name;

-- ------------------------------------------------------------
-- Seed sample images for demonstration
-- ------------------------------------------------------------
INSERT INTO images (image_name, image_path, image_url, title, description, category_id, event, project, uploaded_by, file_size, file_type, width, height, upload_date, status) VALUES
  ('ward-meeting-2024.jpg', '/uploads/images/ward-meeting-2024.jpg', 'https://res.cloudinary.com/demo/image/upload/ward-meeting-2024.jpg', 'Ward Development Meeting', 'Monthly ward development committee meeting held at the ward office.', 1, 'Monthly Development Forum', NULL, 1, 245000, 'image/jpeg', 1920, 1080, '2026-08-15', 'active'),
  ('water-project-1.jpg', '/uploads/images/water-project-1.jpg', 'https://res.cloudinary.com/demo/image/upload/water-project-1.jpg', 'Water Extension Project - Phase I', 'Installation of new water pipes in Kangemi area.', 2, NULL, 'Water Extension Project', 1, 512000, 'image/jpeg', 1920, 1080, '2026-08-10', 'active'),
  ('community-baraza.jpg', '/uploads/images/community-baraza.jpg', 'https://res.cloudinary.com/demo/image/upload/community-baraza.jpg', 'Public Baraza - August 2026', 'Public engagement baraza with ward residents.', 1, 'Public Baraza', NULL, 1, 389000, 'image/jpeg', 1920, 1080, '2026-08-05', 'active'),
  ('staff-team.jpg', '/uploads/images/staff-team.jpg', 'https://res.cloudinary.com/demo/image/upload/staff-team.jpg', 'Ward Staff Team Photo', 'Annual staff team building exercise.', 3, NULL, NULL, 1, 678000, 'image/jpeg', 1920, 1080, '2026-07-28', 'active'),
  ('road-construction.jpg', '/uploads/images/road-construction.jpg', 'https://res.cloudinary.com/demo/image/upload/road-construction.jpg', 'Road Construction - Kangemi Road', 'Ongoing road construction and tarmacking project.', 2, NULL, 'Road Construction Project', 1, 892000, 'image/jpeg', 1920, 1080, '2026-07-20', 'active'),
  ('health-camp.jpg', '/uploads/images/health-camp.jpg', 'https://res.cloudinary.com/demo/image/upload/health-camp.jpg', 'Free Health Camp', 'Free medical camp organized for ward residents.', 1, 'Health Camp', NULL, 1, 445000, 'image/jpeg', 1920, 1080, '2026-07-15', 'active')
ON DUPLICATE KEY UPDATE title = title;
