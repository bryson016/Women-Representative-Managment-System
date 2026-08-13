-- ============================================================
-- Quick Admin/Staff/Citizen User Setup
-- ============================================================
-- Run this in phpMyAdmin SQL tab or MySQL console
-- ============================================================

USE ward_management;

-- Password for all users below: Admin@123
-- Password hash: $2b$10$rR.yJxYNESPKppuGLUDXg.5/WMHJUQE847r79lMNtcoEEsYQE/iR6

-- 1. ADMIN USER
INSERT INTO users (full_name, username, password_hash, role, ward, email, phone_number, is_active)
VALUES (
  'System Administrator',
  'admin',
  '$2b$10$rR.yJxYNESPKppuGLUDXg.5/WMHJUQE847r79lMNtcoEEsYQE/iR6',
  'admin',
  'Westlands',
  'admin@ward.gov.ke',
  '+254 700 000 000',
  TRUE
);

-- 2. STAFF USER
INSERT INTO users (full_name, username, password_hash, role, ward, email, phone_number, is_active)
VALUES (
  'Staff User',
  'staff',
  '$2b$10$rR.yJxYNESPKppuGLUDXg.5/WMHJUQE847r79lMNtcoEEsYQE/iR6',
  'staff',
  'Westlands',
  'staff@ward.gov.ke',
  '+254 700 000 001',
  TRUE
);

-- 3. CITIZEN USER
INSERT INTO users (full_name, username, password_hash, role, ward, email, phone_number, is_active)
VALUES (
  'John Citizen',
  'citizen',
  '$2b$10$rR.yJxYNESPKppuGLUDXg.5/WMHJUQE847r79lMNtcoEEsYQE/iR6',
  'citizen',
  'Westlands',
  'citizen@ward.gov.ke',
  '+254 700 000 002',
  TRUE
);

-- Verify users
SELECT id, full_name, username, role, ward, email, is_active FROM users;
