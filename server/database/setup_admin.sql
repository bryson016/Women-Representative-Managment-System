-- ============================================================
-- Quick Admin/Staff/Citizen User Setup
-- ============================================================
-- Run this in phpMyAdmin SQL tab or MySQL console
-- ============================================================

USE ward_management;

-- 1. ADMIN USER
INSERT INTO users (full_name, username, password_hash, role, ward, email, phone_number, is_active)
VALUES (
  'System Administrator',
  'admin',
  NULL,
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
  NULL,
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
  NULL,
  'citizen',
  'Westlands',
  'citizen@ward.gov.ke',
  '+254 700 000 002',
  TRUE
);

-- Verify users
SELECT id, full_name, username, role, ward, email, is_active FROM users;
