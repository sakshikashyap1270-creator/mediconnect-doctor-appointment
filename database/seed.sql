-- Seed Script for MediConnect SQL Database

-- 1. Insert Users (Password: bcrypt hash of username, e.g. '$2a$10$xyz...' or plain test passwords.
-- Since the auth system uses bcrypt, we can seed standard bcrypt hashes.
-- Let's use standard hashes for:
-- 'admin' -> $2a$10$wKz2L0X.uP9R2.P.U/nCHe0w0kYfOQd0vHqS6p.R.e8Z9U2zW1k2C
-- 'john'  -> $2a$10$wKz2L0X.uP9R2.P.U/nCHe0w0kYfOQd0vHqS6p.R.e8Z9U2zW1k2C
-- 'sarah' -> $2a$10$wKz2L0X.uP9R2.P.U/nCHe0w0kYfOQd0vHqS6p.R.e8Z9U2zW1k2C
-- 'alex'  -> $2a$10$wKz2L0X.uP9R2.P.U/nCHe0w0kYfOQd0vHqS6p.R.e8Z9U2zW1k2C
-- 'ryan'  -> $2a$10$wKz2L0X.uP9R2.P.U/nCHe0w0kYfOQd0vHqS6p.R.e8Z9U2zW1k2C
-- The raw password for all seeded users is 'password123'.

INSERT INTO users (email, password, role, name) VALUES
('admin@mediconnect.com', '$2a$10$d6x1jHn.P1B5zWfN923/e.rX2P91/sS0K/eQp8U0/L0P4J2V2Y4G2', 'admin', 'System Admin'),
('john@patient.com', '$2a$10$d6x1jHn.P1B5zWfN923/e.rX2P91/sS0K/eQp8U0/L0P4J2V2Y4G2', 'patient', 'John Doe'),
('sarah@doctor.com', '$2a$10$d6x1jHn.P1B5zWfN923/e.rX2P91/sS0K/eQp8U0/L0P4J2V2Y4G2', 'doctor', 'Dr. Sarah Jenkins'),
('alex@doctor.com', '$2a$10$d6x1jHn.P1B5zWfN923/e.rX2P91/sS0K/eQp8U0/L0P4J2V2Y4G2', 'doctor', 'Dr. Alex Mercer'),
('ryan@doctor.com', '$2a$10$d6x1jHn.P1B5zWfN923/e.rX2P91/sS0K/eQp8U0/L0P4J2V2Y4G2', 'doctor', 'Dr. Ryan Gosling');

-- 2. Insert Patient profiles
INSERT INTO patients (user_id, dob, gender, contact, insurance, medical_history) VALUES
(2, '1990-05-15', 'Male', '+1 (555) 019-2834', 'BlueCross Shield', 'Mild asthma, seasonal allergies');

-- 3. Insert Doctor profiles
INSERT INTO doctors (user_id, specialization, experience, fee, rating, location, license_number, status, qualifications, bio) VALUES
(3, 'Cardiology', 12, 150.00, 4.9, 'New York Medical Plaza', 'LIC-774920-NY', 'approved', 'MD, FACC - Harvard Medical School', 'Dr. Sarah Jenkins has over 12 years of clinical experience in non-invasive cardiology.'),
(4, 'Pediatrics', 8, 100.00, 4.7, 'Brooklyn Health Center', 'LIC-221983-NY', 'approved', 'MD - Johns Hopkins University', 'Specializing in neonatal care and childhood developmental diagnostics.'),
(5, 'Orthopedics', 5, 110.00, 4.5, 'Manhattan Ortho Clinic', 'LIC-334112-NY', 'pending', 'DO - Stanford Orthopedics Residency', 'Specialist in sports injuries and bone surgery. Awaiting verification.');

-- 4. Seed Time Slots (for the year 2026)
-- Dr. Sarah (doctor_id = 1)
INSERT INTO time_slots (doctor_id, date, time_slot, is_booked) VALUES
(1, '2026-07-10', '09:00 AM', FALSE),
(1, '2026-07-10', '10:30 AM', FALSE),
(1, '2026-07-10', '02:00 PM', FALSE),
(1, '2026-07-10', '03:30 PM', FALSE);

-- Dr. Alex (doctor_id = 2)
INSERT INTO time_slots (doctor_id, date, time_slot, is_booked) VALUES
(2, '2026-07-10', '08:30 AM', FALSE),
(2, '2026-07-10', '10:00 AM', FALSE),
(2, '2026-07-10', '11:30 AM', FALSE);

-- 5. Seed Appointments
INSERT INTO appointments (patient_id, doctor_id, time_slot_id, date, status, fee, payment_status) VALUES
(1, 1, 2, '2026-07-10', 'pending', 150.00, 'unpaid');

-- 6. Seed Reviews
INSERT INTO reviews (doctor_id, patient_name, rating, comment) VALUES
(1, 'John Doe', 5, 'Exceptional attention to details during ECG mapping.');

-- 7. Seed Notifications
INSERT INTO notifications (user_id, message, is_read) VALUES
(2, 'Welcome to MediConnect. Please complete your registration verification.', TRUE);
