-- =========================================================
-- FILE: sql/database.sql
-- SCRIPT FULL DATABASE (SCHEMA DDL + SEED DATA DML)
-- APLIKASI WEB GAJI KARYAWAN (POSTGRESQL)
-- =========================================================

CREATE SCHEMA IF NOT EXISTS "public";

-- ---------------------------------------------------------
-- 1. STUKTUR TABEL (DDL)
-- ---------------------------------------------------------

-- Table Karyawan
CREATE TABLE IF NOT EXISTS "Karyawan" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL DEFAULT 'karyawan123',
    "jabatan" TEXT NOT NULL,
    "statusKerja" TEXT NOT NULL,
    "gajiPokok" DOUBLE PRECISION NOT NULL,
    "tunjanganJabatan" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "nomorRekening" TEXT NOT NULL,
    "namaBank" TEXT NOT NULL,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diubahPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Karyawan_pkey" PRIMARY KEY ("id")
);

-- Table Kehadiran
CREATE TABLE IF NOT EXISTS "Kehadiran" (
    "id" TEXT NOT NULL,
    "karyawanId" TEXT NOT NULL,
    "bulan" INTEGER NOT NULL,
    "tahun" INTEGER NOT NULL,
    "hariHadir" INTEGER NOT NULL,
    "hariSakit" INTEGER NOT NULL,
    "hariCuti" INTEGER NOT NULL,
    "hariAlpha" INTEGER NOT NULL,
    "jamLembur" INTEGER NOT NULL DEFAULT 0,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diubahPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Kehadiran_pkey" PRIMARY KEY ("id")
);

-- Table Penggajian
CREATE TABLE IF NOT EXISTS "Penggajian" (
    "id" TEXT NOT NULL,
    "karyawanId" TEXT NOT NULL,
    "bulan" INTEGER NOT NULL,
    "tahun" INTEGER NOT NULL,
    "gajiPokok" DOUBLE PRECISION NOT NULL,
    "totalTunjangan" DOUBLE PRECISION NOT NULL,
    "totalPotongan" DOUBLE PRECISION NOT NULL,
    "pajakPPh21" DOUBLE PRECISION NOT NULL,
    "gajiBersih" DOUBLE PRECISION NOT NULL,
    "gajiLembur" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "statusPembayaran" TEXT NOT NULL,
    "dibayarPada" TIMESTAMP(3),
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diubahPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Penggajian_pkey" PRIMARY KEY ("id")
);

-- Table Pengaturan
CREATE TABLE IF NOT EXISTS "Pengaturan" (
    "id" TEXT NOT NULL,
    "kunci" TEXT NOT NULL,
    "nilai" TEXT NOT NULL,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diubahPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pengaturan_pkey" PRIMARY KEY ("id")
);

-- Table PengajuanIzin
CREATE TABLE IF NOT EXISTS "PengajuanIzin" (
    "id" TEXT NOT NULL,
    "karyawanId" TEXT NOT NULL,
    "jenis" TEXT NOT NULL,
    "tanggalMulai" TEXT NOT NULL,
    "tanggalSelesai" TEXT NOT NULL,
    "keterangan" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diubahPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PengajuanIzin_pkey" PRIMARY KEY ("id")
);

-- Table Admin
CREATE TABLE IF NOT EXISTS "Admin" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL DEFAULT 'Administrator',
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diubahPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- Indexes & Unique Constraints
CREATE UNIQUE INDEX IF NOT EXISTS "Karyawan_email_key" ON "Karyawan"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "Kehadiran_karyawanId_bulan_tahun_key" ON "Kehadiran"("karyawanId", "bulan", "tahun");
CREATE UNIQUE INDEX IF NOT EXISTS "Penggajian_karyawanId_bulan_tahun_key" ON "Penggajian"("karyawanId", "bulan", "tahun");
CREATE UNIQUE INDEX IF NOT EXISTS "Pengaturan_kunci_key" ON "Pengaturan"("kunci");
CREATE UNIQUE INDEX IF NOT EXISTS "Admin_email_key" ON "Admin"("email");

-- Foreign Keys
ALTER TABLE "Kehadiran" DROP CONSTRAINT IF EXISTS "Kehadiran_karyawanId_fkey";
ALTER TABLE "Kehadiran" ADD CONSTRAINT "Kehadiran_karyawanId_fkey" FOREIGN KEY ("karyawanId") REFERENCES "Karyawan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Penggajian" DROP CONSTRAINT IF EXISTS "Penggajian_karyawanId_fkey";
ALTER TABLE "Penggajian" ADD CONSTRAINT "Penggajian_karyawanId_fkey" FOREIGN KEY ("karyawanId") REFERENCES "Karyawan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PengajuanIzin" DROP CONSTRAINT IF EXISTS "PengajuanIzin_karyawanId_fkey";
ALTER TABLE "PengajuanIzin" ADD CONSTRAINT "PengajuanIzin_karyawanId_fkey" FOREIGN KEY ("karyawanId") REFERENCES "Karyawan"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- ---------------------------------------------------------
-- 2. SEED DATA AWAL (DML)
-- ---------------------------------------------------------

-- Admin
INSERT INTO "Admin" ("id", "nama", "email", "password", "dibuatPada", "diubahPada")
VALUES ('admin-001', 'Administrator', 'admin@gajikita.com', 'passwordadmin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("email") DO NOTHING;

-- Karyawan
INSERT INTO "Karyawan" ("id", "nama", "email", "password", "jabatan", "statusKerja", "gajiPokok", "tunjanganJabatan", "namaBank", "nomorRekening", "dibuatPada", "diubahPada")
VALUES 
  ('emp-001', 'Rian Wijaya', 'rian.wijaya@gajikita.com', 'karyawan123', 'Manager', 'TETAP', 15000000, 3000000, 'BCA', '5241088921', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('emp-002', 'Siti Rahmawati', 'siti.rahma@gajikita.com', 'karyawan123', 'Senior Developer', 'TETAP', 12000000, 2000000, 'Mandiri', '132009876543', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('emp-003', 'Budi Santoso', 'budi.santoso@gajikita.com', 'karyawan123', 'Software Engineer', 'KONTRAK', 8500000, 1000000, 'BNI', '0987654321', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('emp-004', 'Dewi Lestari', 'dewi.lestari@gajikita.com', 'karyawan123', 'QA Engineer', 'KONTRAK', 7000000, 500000, 'BRI', '0012019876543', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('emp-005', 'Andi Pratama', 'andi.pratama@gajikita.com', 'karyawan123', 'Staff Admin', 'TETAP', 5500000, 0, 'BCA', '5241099234', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("email") DO NOTHING;

-- Kehadiran
INSERT INTO "Kehadiran" ("id", "karyawanId", "bulan", "tahun", "hariHadir", "hariSakit", "hariCuti", "hariAlpha", "jamLembur", "dibuatPada", "diubahPada")
VALUES 
  ('h-001', 'emp-001', 7, 2026, 22, 0, 0, 0, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('h-002', 'emp-002', 7, 2026, 21, 1, 0, 0, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('h-003', 'emp-003', 7, 2026, 20, 0, 2, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('h-004', 'emp-004', 7, 2026, 18, 2, 0, 2, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("karyawanId", "bulan", "tahun") DO NOTHING;
