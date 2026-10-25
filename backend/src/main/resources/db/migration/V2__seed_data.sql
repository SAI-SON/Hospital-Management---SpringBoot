-- =============================================================================
-- MediBook Hospital Appointment Booking System - Seed Data (V2)
-- =============================================================================

-- 1. INSERT ROLES
INSERT INTO roles (id, name, description) VALUES
(1, 'ROLE_ADMIN', 'Hospital System Administrator with full oversight and platform controls'),
(2, 'ROLE_DOCTOR', 'Medical practitioner managing appointments, availability, and patients'),
(3, 'ROLE_PATIENT', 'Registered healthcare customer booking appointments and reviews')
ON CONFLICT (id) DO NOTHING;

-- Reset sequence for roles
SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles));

-- 2. INSERT CORE SPECIALIZATIONS
INSERT INTO specializations (name, description, icon_name, is_active) VALUES
('Cardiology', 'Heart and cardiovascular system health and surgical evaluations', 'Heart', true),
('Dermatology', 'Skin, hair, nails, and cosmetic dermatological health', 'Sparkles', true),
('Pediatrics', 'Comprehensive physical, behavioral, and mental health for infants and children', 'Baby', true),
('Orthopedics', 'Musculoskeletal system, bone fractures, joints, and spine care', 'Activity', true),
('Neurology', 'Brain, spinal cord, nerves, and neurological disorders treatment', 'Brain', true),
('General Medicine', 'Primary care, fever, diabetes, routine health checkups, and diagnosis', 'Stethoscope', true),
('Psychiatry', 'Mental health assessments, therapies, and emotional wellness', 'Smile', true),
('Gynecology', 'Female reproductive health, maternity, and prenatal care', 'Flower2', true)
ON CONFLICT (name) DO NOTHING;

-- 3. INSERT DEFAULT ADMIN USER (Password: Admin@123)
-- BCrypt cost 10 hash of 'Admin@123'
INSERT INTO users (id, email, password_hash, role_id, status, failed_login_attempts) VALUES
(1, 'admin@medibook.com', '$2a$10$eh1c.JyrIyjTZ2CpDr354.qHlYN6xwDG8hr0dzsc3yXLXnVbLXZsu', 1, 'ACTIVE', 0)
ON CONFLICT (email) DO NOTHING;

SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
