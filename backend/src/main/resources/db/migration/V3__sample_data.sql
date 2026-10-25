-- =============================================================================
-- MediBook Hospital Appointment Booking System - Comprehensive Sample Data (V3)
-- =============================================================================

-- Ensure column width for blood_group accommodates enum values
ALTER TABLE patients ALTER COLUMN blood_group TYPE VARCHAR(20);

-- 1. INSERT DOCTOR USERS (Password: Admin@123)
-- role_id 2 = ROLE_DOCTOR, role_id 3 = ROLE_PATIENT
INSERT INTO users (id, email, password_hash, role_id, status, failed_login_attempts) VALUES
(101, 'doctor.sarah@medibook.com', '$2a$10$eh1c.JyrIyjTZ2CpDr354.qHlYN6xwDG8hr0dzsc3yXLXnVbLXZsu', 2, 'ACTIVE', 0),
(102, 'doctor.rajesh@medibook.com', '$2a$10$eh1c.JyrIyjTZ2CpDr354.qHlYN6xwDG8hr0dzsc3yXLXnVbLXZsu', 2, 'ACTIVE', 0),
(103, 'doctor.priya@medibook.com', '$2a$10$eh1c.JyrIyjTZ2CpDr354.qHlYN6xwDG8hr0dzsc3yXLXnVbLXZsu', 2, 'ACTIVE', 0),
(104, 'doctor.michael@medibook.com', '$2a$10$eh1c.JyrIyjTZ2CpDr354.qHlYN6xwDG8hr0dzsc3yXLXnVbLXZsu', 2, 'ACTIVE', 0),
(105, 'doctor.ananya@medibook.com', '$2a$10$eh1c.JyrIyjTZ2CpDr354.qHlYN6xwDG8hr0dzsc3yXLXnVbLXZsu', 2, 'ACTIVE', 0),
(106, 'doctor.vikram@medibook.com', '$2a$10$eh1c.JyrIyjTZ2CpDr354.qHlYN6xwDG8hr0dzsc3yXLXnVbLXZsu', 2, 'ACTIVE', 0),
(107, 'doctor.kavitha@medibook.com', '$2a$10$eh1c.JyrIyjTZ2CpDr354.qHlYN6xwDG8hr0dzsc3yXLXnVbLXZsu', 2, 'ACTIVE', 0),
(108, 'doctor.david@medibook.com', '$2a$10$eh1c.JyrIyjTZ2CpDr354.qHlYN6xwDG8hr0dzsc3yXLXnVbLXZsu', 2, 'ACTIVE', 0)
ON CONFLICT (email) DO NOTHING;

-- 2. INSERT PATIENT USERS (Password: Admin@123)
INSERT INTO users (id, email, password_hash, role_id, status, failed_login_attempts) VALUES
(201, 'patient.john@medibook.com', '$2a$10$eh1c.JyrIyjTZ2CpDr354.qHlYN6xwDG8hr0dzsc3yXLXnVbLXZsu', 3, 'ACTIVE', 0),
(202, 'patient.meera@medibook.com', '$2a$10$eh1c.JyrIyjTZ2CpDr354.qHlYN6xwDG8hr0dzsc3yXLXnVbLXZsu', 3, 'ACTIVE', 0),
(203, 'patient.rahul@medibook.com', '$2a$10$eh1c.JyrIyjTZ2CpDr354.qHlYN6xwDG8hr0dzsc3yXLXnVbLXZsu', 3, 'ACTIVE', 0),
(204, 'patient.sneha@medibook.com', '$2a$10$eh1c.JyrIyjTZ2CpDr354.qHlYN6xwDG8hr0dzsc3yXLXnVbLXZsu', 3, 'ACTIVE', 0)
ON CONFLICT (email) DO NOTHING;

-- 3. INSERT DOCTOR PROFILES
INSERT INTO doctors (
    id, user_id, specialization_id, full_name, license_number, years_of_experience,
    consultation_fee, bio, clinic_address, clinic_city, phone_number, avatar_url,
    rating_average, total_reviews, is_approved, is_available
) VALUES
(
    1, 101, 1, 'Dr. Sarah Jenkins, MD, FACC', 'MED-LIC-00101', 15,
    120.00, 'Senior Interventional Cardiologist specializing in preventive heart health, coronary angiograms, echocardiograms, and lipid disorder management. Fellow of the American College of Cardiology.',
    'Apollo Specialty Heart Center, Greams Road', 'Chennai', '+91 98401 23456',
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
    4.90, 48, true, true
),
(
    2, 102, 6, 'Dr. Rajesh Sharma, MBBS, MD', 'MED-LIC-00102', 18,
    60.00, 'Chief Physician with extensive experience in internal medicine, infectious illnesses, hypertension, chronic disease stabilization, and preventative annual wellness screenings.',
    'MediLife Clinic, Indiranagar 100ft Road', 'Bangalore', '+91 98801 87654',
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
    4.85, 62, true, true
),
(
    3, 103, 3, 'Dr. Priya Ramanathan, MD (Pediatrics)', 'MED-LIC-00103', 12,
    75.00, 'Compassionate pediatrician focusing on newborn growth benchmarks, child nutritional guidance, preventive immunizations, and developmental behavioral milestone evaluations.',
    'Rainbow Child & Maternity Hospital, T. Nagar', 'Chennai', '+91 94441 55667',
    'https://images.unsplash.com/photo-1594824813515-5853f5a2e5d8?auto=format&fit=crop&q=80&w=400',
    4.95, 74, true, true
),
(
    4, 104, 4, 'Dr. Michael Chen, MS (Ortho), MCh', 'MED-LIC-00104', 14,
    110.00, 'Renowned orthopedic surgeon specializing in robotic knee and hip replacements, arthroscopy, sports injury rehabilitation, and vertebral musculoskeletal care.',
    'Fortis Bone & Joint Pavilion, Bannerghatta', 'Bangalore', '+91 99160 33442',
    'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400',
    4.88, 39, true, true
),
(
    5, 105, 2, 'Dr. Ananya Desai, MD (Dermatology)', 'MED-LIC-00105', 10,
    70.00, 'Expert clinical and cosmetic dermatologist specializing in chronic psoriasis, acne scar lasers, hair-loss therapies, and clinical skin rejuvenation.',
    'Aura Derma Care, Bandra West', 'Mumbai', '+91 98200 44556',
    'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=400',
    4.92, 53, true, true
),
(
    6, 106, 5, 'Dr. Vikram Malhotra, DM (Neurology)', 'MED-LIC-00106', 20,
    140.00, 'Distinguished neurologist leading acute stroke care, epilepsy management, migraine clinical trials, and neuromuscular degenerative condition therapy.',
    'Max Super Speciality Hospital, Saket', 'Delhi', '+91 98110 77889',
    'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400',
    4.91, 57, true, true
),
(
    7, 107, 8, 'Dr. Kavitha Sundaram, MS, DGO, FICOG', 'MED-LIC-00107', 16,
    90.00, 'Consultant Obstetrician & Gynecologist with expertise in high-risk pregnancy deliveries, laparoscopic procedures, PCOS, and reproductive endocrinology.',
    'Motherhood Care Center, Anna Nagar', 'Chennai', '+91 98411 99882',
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=400',
    4.87, 44, true, true
),
(
    8, 108, 7, 'Dr. David Miller, MD (Psychiatry)', 'MED-LIC-00108', 11,
    95.00, 'Compassionate psychiatrist and mental health specialist providing holistic cognitive behavioral therapies, anxiety/depression relief, and workplace stress guidance.',
    'MindWell Behavioral Center, Cyber City', 'Hyderabad', '+91 99490 11223',
    'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=400',
    4.79, 31, true, true
)
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    specialization_id = EXCLUDED.specialization_id,
    consultation_fee = EXCLUDED.consultation_fee,
    clinic_city = EXCLUDED.clinic_city,
    clinic_address = EXCLUDED.clinic_address,
    rating_average = EXCLUDED.rating_average,
    total_reviews = EXCLUDED.total_reviews,
    avatar_url = EXCLUDED.avatar_url,
    is_approved = true,
    is_available = true;

-- 4. INSERT PATIENT PROFILES
INSERT INTO patients (
    id, user_id, full_name, phone_number, date_of_birth, gender, blood_group,
    emergency_contact, address, avatar_url
) VALUES
(
    1, 201, 'John Miller', '+91 98401 11223', '1992-04-15', 'MALE', 'O_POSITIVE',
    '+91 98401 99887', '42 Palm Grove, Nungambakkam, Chennai',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300'
),
(
    2, 202, 'Meera Krishnan', '+91 98802 22334', '1996-09-21', 'FEMALE', 'B_POSITIVE',
    '+91 98802 88776', '18 Koramangala 4th Block, Bangalore',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300'
),
(
    3, 203, 'Rahul Verma', '+91 98203 33445', '1988-11-03', 'MALE', 'A_POSITIVE',
    '+91 98203 77665', '104 Sea View Apartments, Worli, Mumbai',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=300'
),
(
    4, 204, 'Sneha Patel', '+91 98114 44556', '1999-07-28', 'FEMALE', 'AB_POSITIVE',
    '+91 98114 66554', 'B-12 Greater Kailash I, New Delhi',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'
)
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone_number = EXCLUDED.phone_number,
    date_of_birth = EXCLUDED.date_of_birth,
    gender = EXCLUDED.gender,
    blood_group = EXCLUDED.blood_group,
    emergency_contact = EXCLUDED.emergency_contact,
    address = EXCLUDED.address;

-- 5. INSERT DOCTOR AVAILABILITY SCHEDULES (Monday=1 through Saturday=6)
-- Doctor 1 (Sarah)
INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time, slot_duration_minutes, break_start_time, break_end_time, is_active) VALUES
(1, 1, '09:00:00', '13:00:00', 30, '13:00:00', '14:00:00', true),
(1, 2, '09:00:00', '13:00:00', 30, '13:00:00', '14:00:00', true),
(1, 3, '09:00:00', '13:00:00', 30, '13:00:00', '14:00:00', true),
(1, 4, '09:00:00', '13:00:00', 30, '13:00:00', '14:00:00', true),
(1, 5, '09:00:00', '13:00:00', 30, '13:00:00', '14:00:00', true)
ON CONFLICT (doctor_id, day_of_week) DO UPDATE SET is_active = true;

-- Doctor 2 (Rajesh)
INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time, slot_duration_minutes, break_start_time, break_end_time, is_active) VALUES
(2, 1, '10:00:00', '16:00:00', 30, '13:00:00', '14:00:00', true),
(2, 2, '10:00:00', '16:00:00', 30, '13:00:00', '14:00:00', true),
(2, 3, '10:00:00', '16:00:00', 30, '13:00:00', '14:00:00', true),
(2, 4, '10:00:00', '16:00:00', 30, '13:00:00', '14:00:00', true),
(2, 5, '10:00:00', '16:00:00', 30, '13:00:00', '14:00:00', true),
(2, 6, '10:00:00', '13:00:00', 30, NULL, NULL, true)
ON CONFLICT (doctor_id, day_of_week) DO UPDATE SET is_active = true;

-- Doctor 3 (Priya)
INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time, slot_duration_minutes, break_start_time, break_end_time, is_active) VALUES
(3, 1, '09:30:00', '14:30:00', 30, '12:30:00', '13:00:00', true),
(3, 2, '09:30:00', '14:30:00', 30, '12:30:00', '13:00:00', true),
(3, 3, '09:30:00', '14:30:00', 30, '12:30:00', '13:00:00', true),
(3, 4, '09:30:00', '14:30:00', 30, '12:30:00', '13:00:00', true),
(3, 5, '09:30:00', '14:30:00', 30, '12:30:00', '13:00:00', true)
ON CONFLICT (doctor_id, day_of_week) DO UPDATE SET is_active = true;

-- Doctor 4 (Michael)
INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time, slot_duration_minutes, break_start_time, break_end_time, is_active) VALUES
(4, 2, '11:00:00', '17:00:00', 30, '13:30:00', '14:30:00', true),
(4, 3, '11:00:00', '17:00:00', 30, '13:30:00', '14:30:00', true),
(4, 4, '11:00:00', '17:00:00', 30, '13:30:00', '14:30:00', true),
(4, 5, '11:00:00', '17:00:00', 30, '13:30:00', '14:30:00', true),
(4, 6, '10:00:00', '14:00:00', 30, NULL, NULL, true)
ON CONFLICT (doctor_id, day_of_week) DO UPDATE SET is_active = true;

-- 6. INSERT UPCOMING BOOKABLE SLOTS FOR THE NEXT 5 DAYS (Relative to CURRENT_DATE)
-- Dr. Sarah (Doctor 1) Tomorrow
INSERT INTO slots (doctor_id, slot_start, slot_end, is_booked, version) VALUES
(1, (CURRENT_DATE + INTERVAL '1 day' + TIME '09:00:00')::timestamptz, (CURRENT_DATE + INTERVAL '1 day' + TIME '09:30:00')::timestamptz, false, 0),
(1, (CURRENT_DATE + INTERVAL '1 day' + TIME '09:30:00')::timestamptz, (CURRENT_DATE + INTERVAL '1 day' + TIME '10:00:00')::timestamptz, true, 1),
(1, (CURRENT_DATE + INTERVAL '1 day' + TIME '10:00:00')::timestamptz, (CURRENT_DATE + INTERVAL '1 day' + TIME '10:30:00')::timestamptz, false, 0),
(1, (CURRENT_DATE + INTERVAL '1 day' + TIME '10:30:00')::timestamptz, (CURRENT_DATE + INTERVAL '1 day' + TIME '11:00:00')::timestamptz, false, 0),
(1, (CURRENT_DATE + INTERVAL '1 day' + TIME '11:00:00')::timestamptz, (CURRENT_DATE + INTERVAL '1 day' + TIME '11:30:00')::timestamptz, false, 0),
(1, (CURRENT_DATE + INTERVAL '1 day' + TIME '11:30:00')::timestamptz, (CURRENT_DATE + INTERVAL '1 day' + TIME '12:00:00')::timestamptz, false, 0),
-- Dr. Sarah (Doctor 1) Day After Tomorrow
(1, (CURRENT_DATE + INTERVAL '2 days' + TIME '09:00:00')::timestamptz, (CURRENT_DATE + INTERVAL '2 days' + TIME '09:30:00')::timestamptz, false, 0),
(1, (CURRENT_DATE + INTERVAL '2 days' + TIME '09:30:00')::timestamptz, (CURRENT_DATE + INTERVAL '2 days' + TIME '10:00:00')::timestamptz, false, 0),
(1, (CURRENT_DATE + INTERVAL '2 days' + TIME '10:00:00')::timestamptz, (CURRENT_DATE + INTERVAL '2 days' + TIME '10:30:00')::timestamptz, false, 0),
(1, (CURRENT_DATE + INTERVAL '2 days' + TIME '10:30:00')::timestamptz, (CURRENT_DATE + INTERVAL '2 days' + TIME '11:00:00')::timestamptz, false, 0),
-- Dr. Rajesh (Doctor 2) Tomorrow
(2, (CURRENT_DATE + INTERVAL '1 day' + TIME '10:00:00')::timestamptz, (CURRENT_DATE + INTERVAL '1 day' + TIME '10:30:00')::timestamptz, false, 0),
(2, (CURRENT_DATE + INTERVAL '1 day' + TIME '10:30:00')::timestamptz, (CURRENT_DATE + INTERVAL '1 day' + TIME '11:00:00')::timestamptz, true, 1),
(2, (CURRENT_DATE + INTERVAL '1 day' + TIME '11:00:00')::timestamptz, (CURRENT_DATE + INTERVAL '1 day' + TIME '11:30:00')::timestamptz, false, 0),
(2, (CURRENT_DATE + INTERVAL '1 day' + TIME '11:30:00')::timestamptz, (CURRENT_DATE + INTERVAL '1 day' + TIME '12:00:00')::timestamptz, false, 0),
(2, (CURRENT_DATE + INTERVAL '1 day' + TIME '14:00:00')::timestamptz, (CURRENT_DATE + INTERVAL '1 day' + TIME '14:30:00')::timestamptz, false, 0),
-- Dr. Priya (Doctor 3) Tomorrow
(3, (CURRENT_DATE + INTERVAL '1 day' + TIME '09:30:00')::timestamptz, (CURRENT_DATE + INTERVAL '1 day' + TIME '10:00:00')::timestamptz, false, 0),
(3, (CURRENT_DATE + INTERVAL '1 day' + TIME '10:00:00')::timestamptz, (CURRENT_DATE + INTERVAL '1 day' + TIME '10:30:00')::timestamptz, false, 0),
(3, (CURRENT_DATE + INTERVAL '1 day' + TIME '10:30:00')::timestamptz, (CURRENT_DATE + INTERVAL '1 day' + TIME '11:00:00')::timestamptz, false, 0),
-- Past Slots for Completed Appointments
(1, (CURRENT_DATE - INTERVAL '3 days' + TIME '10:00:00')::timestamptz, (CURRENT_DATE - INTERVAL '3 days' + TIME '10:30:00')::timestamptz, true, 1),
(2, (CURRENT_DATE - INTERVAL '2 days' + TIME '11:00:00')::timestamptz, (CURRENT_DATE - INTERVAL '2 days' + TIME '11:30:00')::timestamptz, true, 1),
(3, (CURRENT_DATE - INTERVAL '1 day' + TIME '10:00:00')::timestamptz, (CURRENT_DATE - INTERVAL '1 day' + TIME '10:30:00')::timestamptz, true, 1)
ON CONFLICT (doctor_id, slot_start) DO NOTHING;

-- 7. INSERT APPOINTMENTS
-- Completed appointment 1
INSERT INTO appointments (
    id, reference_no, patient_id, doctor_id, slot_id, appointment_date, start_time, end_time,
    status, reason, consultation_notes
) VALUES
(
    1, 'MB-2026-00101', 1, 1,
    (SELECT id FROM slots WHERE doctor_id = 1 AND slot_start = (CURRENT_DATE - INTERVAL '3 days' + TIME '10:00:00')::timestamptz LIMIT 1),
    CURRENT_DATE - INTERVAL '3 days', '10:00:00', '10:30:00',
    'COMPLETED', 'Occasional chest tightness and shortness of breath during morning jogs',
    'ECG performed and normal sinus rhythm recorded. Blood pressure 120/80. Advised 2D Echocardiogram and lipid profile test in 2 weeks. Follow healthy low-sodium diet.'
),
-- Completed appointment 2
(
    2, 'MB-2026-00102', 2, 2,
    (SELECT id FROM slots WHERE doctor_id = 2 AND slot_start = (CURRENT_DATE - INTERVAL '2 days' + TIME '11:00:00')::timestamptz LIMIT 1),
    CURRENT_DATE - INTERVAL '2 days', '11:00:00', '11:30:00',
    'COMPLETED', 'Severe seasonal fever, persistent body ache and cough for 4 days',
    'Diagnosed acute viral upper respiratory tract infection. Prescribed Paracetamol 650mg TDS, warm saline gargle, hydration, and steam inhalation. Review if fever persists over 48 hours.'
),
-- Upcoming Confirmed appointment 3
(
    3, 'MB-2026-00103', 1, 1,
    (SELECT id FROM slots WHERE doctor_id = 1 AND slot_start = (CURRENT_DATE + INTERVAL '1 day' + TIME '09:30:00')::timestamptz LIMIT 1),
    CURRENT_DATE + INTERVAL '1 day', '09:30:00', '10:00:00',
    'CONFIRMED', 'Follow-up cardiology consultation with lipid panel and echo reports',
    NULL
),
-- Upcoming Confirmed appointment 4
(
    4, 'MB-2026-00104', 3, 2,
    (SELECT id FROM slots WHERE doctor_id = 2 AND slot_start = (CURRENT_DATE + INTERVAL '1 day' + TIME '10:30:00')::timestamptz LIMIT 1),
    CURRENT_DATE + INTERVAL '1 day', '10:30:00', '11:00:00',
    'CONFIRMED', 'Routine quarterly diabetic checkup and HbA1c review',
    NULL
)
ON CONFLICT (reference_no) DO NOTHING;

-- 8. INSERT REVIEWS FOR COMPLETED APPOINTMENTS
INSERT INTO reviews (id, appointment_id, patient_id, doctor_id, rating, comment) VALUES
(
    1, 1, 1, 1, 5,
    'Dr. Sarah Jenkins was incredibly empathetic and meticulous. She patiently explained the ECG results and put all my cardiac worries to rest. Highly recommended cardiologist!'
),
(
    2, 2, 2, 2, 5,
    'Dr. Rajesh gave an exact diagnosis without unnecessary medications. My fever subsided within 24 hours. The clinic atmosphere and staff were prompt and polite.'
)
ON CONFLICT (appointment_id) DO NOTHING;

-- 9. INSERT NOTIFICATIONS
INSERT INTO notifications (user_id, title, message, type, is_read) VALUES
(201, 'Appointment Confirmed', 'Your appointment with Dr. Sarah Jenkins (Cardiology) is confirmed for tomorrow at 09:30 AM. Ref: MB-2026-00103', 'APPOINTMENT_CONFIRMED', false),
(101, 'New Appointment Scheduled', 'Patient John Miller has booked a consultation slot for tomorrow at 09:30 AM.', 'NEW_APPOINTMENT', false),
(203, 'Appointment Confirmed', 'Your appointment with Dr. Rajesh Sharma (General Medicine) is confirmed for tomorrow at 10:30 AM. Ref: MB-2026-00104', 'APPOINTMENT_CONFIRMED', false)
ON CONFLICT DO NOTHING;

-- 10. RE-SYNCHRONIZE ALL DATABASE SEQUENCES
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users));
SELECT setval('doctors_id_seq', (SELECT COALESCE(MAX(id), 1) FROM doctors));
SELECT setval('patients_id_seq', (SELECT COALESCE(MAX(id), 1) FROM patients));
SELECT setval('doctor_availability_id_seq', (SELECT COALESCE(MAX(id), 1) FROM doctor_availability));
SELECT setval('slots_id_seq', (SELECT COALESCE(MAX(id), 1) FROM slots));
SELECT setval('appointments_id_seq', (SELECT COALESCE(MAX(id), 1) FROM appointments));
SELECT setval('reviews_id_seq', (SELECT COALESCE(MAX(id), 1) FROM reviews));
SELECT setval('notifications_id_seq', (SELECT COALESCE(MAX(id), 1) FROM notifications));
