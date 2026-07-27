-- =========================================================
-- FILE: sql/schema.sql
-- DDL Schema Database Web Gaji Karyawan (PostgreSQL)
-- =========================================================

CREATE SCHEMA IF NOT EXISTS "public";

-- 1. Table Karyawan
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

-- 2. Table Kehadiran
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

-- 3. Table Penggajian
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

-- 4. Table Pengaturan
CREATE TABLE IF NOT EXISTS "Pengaturan" (
    "id" TEXT NOT NULL,
    "kunci" TEXT NOT NULL,
    "nilai" TEXT NOT NULL,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diubahPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pengaturan_pkey" PRIMARY KEY ("id")
);

-- 5. Table PengajuanIzin
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

-- 6. Table Admin
CREATE TABLE IF NOT EXISTS "Admin" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL DEFAULT 'Administrator',
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diubahPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- Unique Indexes & Constraints
CREATE UNIQUE INDEX IF NOT EXISTS "Karyawan_email_key" ON "Karyawan"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "Kehadiran_karyawanId_bulan_tahun_key" ON "Kehadiran"("karyawanId", "bulan", "tahun");
CREATE UNIQUE INDEX IF NOT EXISTS "Penggajian_karyawanId_bulan_tahun_key" ON "Penggajian"("karyawanId", "bulan", "tahun");
CREATE UNIQUE INDEX IF NOT EXISTS "Pengaturan_kunci_key" ON "Pengaturan"("kunci");
CREATE UNIQUE INDEX IF NOT EXISTS "Admin_email_key" ON "Admin"("email");

-- Foreign Key Constraints
ALTER TABLE "Kehadiran" DROP CONSTRAINT IF EXISTS "Kehadiran_karyawanId_fkey";
ALTER TABLE "Kehadiran" ADD CONSTRAINT "Kehadiran_karyawanId_fkey" FOREIGN KEY ("karyawanId") REFERENCES "Karyawan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Penggajian" DROP CONSTRAINT IF EXISTS "Penggajian_karyawanId_fkey";
ALTER TABLE "Penggajian" ADD CONSTRAINT "Penggajian_karyawanId_fkey" FOREIGN KEY ("karyawanId") REFERENCES "Karyawan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PengajuanIzin" DROP CONSTRAINT IF EXISTS "PengajuanIzin_karyawanId_fkey";
ALTER TABLE "PengajuanIzin" ADD CONSTRAINT "PengajuanIzin_karyawanId_fkey" FOREIGN KEY ("karyawanId") REFERENCES "Karyawan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
