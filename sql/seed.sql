-- =========================================================
-- FILE: sql/seed.sql
-- DML Data Awal (Seed Data) Aplikasi Web Gaji Karyawan
-- =========================================================

-- Seed Data Admin
INSERT INTO "Admin" ("id", "nama", "email", "password", "dibuatPada", "diubahPada")
VALUES 
  ('admin-001', 'Administrator', 'admin@gajikita.com', 'passwordadmin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("email") DO NOTHING;

-- Seed Data Karyawan
INSERT INTO "Karyawan" ("id", "nama", "email", "password", "jabatan", "statusKerja", "gajiPokok", "tunjanganJabatan", "namaBank", "nomorRekening", "dibuatPada", "diubahPada")
VALUES 
  ('emp-001', 'Rian Wijaya', 'rian.wijaya@gajikita.com', 'karyawan123', 'Manager', 'TETAP', 15000000, 3000000, 'BCA', '5241088921', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('emp-002', 'Siti Rahmawati', 'siti.rahma@gajikita.com', 'karyawan123', 'Senior Developer', 'TETAP', 12000000, 2000000, 'Mandiri', '132009876543', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('emp-003', 'Budi Santoso', 'budi.santoso@gajikita.com', 'karyawan123', 'Software Engineer', 'KONTRAK', 8500000, 1000000, 'BNI', '0987654321', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('emp-004', 'Dewi Lestari', 'dewi.lestari@gajikita.com', 'karyawan123', 'QA Engineer', 'KONTRAK', 7000000, 500000, 'BRI', '0012019876543', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('emp-005', 'Andi Pratama', 'andi.pratama@gajikita.com', 'karyawan123', 'Staff Admin', 'TETAP', 5500000, 0, 'BCA', '5241099234', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("email") DO NOTHING;

-- Seed Data Kehadiran Contoh
INSERT INTO "Kehadiran" ("id", "karyawanId", "bulan", "tahun", "hariHadir", "hariSakit", "hariCuti", "hariAlpha", "jamLembur", "dibuatPada", "diubahPada")
VALUES 
  ('h-001', 'emp-001', 7, 2026, 22, 0, 0, 0, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('h-002', 'emp-002', 7, 2026, 21, 1, 0, 0, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('h-003', 'emp-003', 7, 2026, 20, 0, 2, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('h-004', 'emp-004', 7, 2026, 18, 2, 0, 2, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("karyawanId", "bulan", "tahun") DO NOTHING;
