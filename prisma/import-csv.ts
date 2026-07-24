/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * ============================================================
 *  SCRIPT IMPORT DATASET CSV KARYAWAN → DATABASE
 *  Dataset: "data base karyawan fiktif" (Kaggle - husmoonx)
 *  Kolom: ID, Nama, Usia, Alamat, Nomor Telepon, Jabatan,
 *         Gaji, Tanggal Mulai, Departemen, Status Pernikahan,
 *         Email, Atribut Khusus
 * ============================================================
 *  CARA PAKAI:
 *  Preview  : npm run db:import:preview
 *  Import   : npm run db:import
 * ============================================================
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { randomUUID } from 'crypto';
import 'dotenv/config';

// ──────────────────────────────────────────────
// PATH FILE CSV
// ──────────────────────────────────────────────
// Prioritaskan file dataset dengan ID karyawan
let CSV_FILE_PATH = path.join(__dirname, 'dataset_penggajian_100_karyawan_dengan_id.csv');
if (!fs.existsSync(CSV_FILE_PATH)) {
  CSV_FILE_PATH = path.join(__dirname, 'dataset_penggajian_100_karyawan_jurusan_kantor_dengan_lembur.csv');
}
if (!fs.existsSync(CSV_FILE_PATH)) {
  CSV_FILE_PATH = path.join(__dirname, 'data', 'karyawan.csv');
}

// ──────────────────────────────────────────────
// KONSTANTA
// ──────────────────────────────────────────────
const DEFAULT_PASSWORD = 'karyawan123';

// Mapping jabatan → tunjangan jabatan (10-20% dari gaji)
const TUNJANGAN_RATIO: Record<string, number> = {
  'ceo'        : 0.25,
  'cto'        : 0.25,
  'director'   : 0.22,
  'manager'    : 0.18,
  'supervisor' : 0.15,
  'senior'     : 0.12,
  'consultant' : 0.12,
  'analyst'    : 0.10,
  'engineer'   : 0.10,
  'technician' : 0.08,
  'assistant'  : 0.07,
  'staff'      : 0.05,
  'admin'      : 0.05,
};

// Mapping departemen → nama bank yang umum
const BANK_PER_DEPT: Record<string, string> = {
  'finance'    : 'Mandiri',
  'it'         : 'BCA',
  'sales'      : 'BRI',
  'marketing'  : 'BNI',
  'operations' : 'BCA',
  'hr'         : 'Mandiri',
  'legal'      : 'CIMB',
};

// ──────────────────────────────────────────────
// HELPER FUNCTIONS
// ──────────────────────────────────────────────

function parseGaji(val: string): number {
  if (!val) return 5000000;
  const cleaned = val.replace(/[^0-9]/g, '');
  return parseInt(cleaned) || 5000000;
}

function hitungTunjangan(gaji: number, jabatan: string): number {
  const j = jabatan.toLowerCase();
  for (const [key, ratio] of Object.entries(TUNJANGAN_RATIO)) {
    if (j.includes(key)) return Math.round(gaji * ratio);
  }
  return Math.round(gaji * 0.08); // default 8%
}

function tentukanBank(departemen: string): string {
  const d = departemen.toLowerCase();
  for (const [key, bank] of Object.entries(BANK_PER_DEPT)) {
    if (d.includes(key)) return bank;
  }
  const banks = ['BCA', 'Mandiri', 'BNI', 'BRI', 'CIMB'];
  return banks[Math.floor(Math.random() * banks.length)];
}

function tentukanStatus(jabatan: string): 'TETAP' | 'KONTRAK' {
  const tetap = ['manager', 'director', 'ceo', 'cto', 'supervisor', 'senior'];
  const j = jabatan.toLowerCase();
  return tetap.some(t => j.includes(t)) ? 'TETAP' : (Math.random() > 0.35 ? 'TETAP' : 'KONTRAK');
}

function generateNoRek(): string {
  return Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join('');
}

function generateKehadiran(bulan: number, tahun: number) {
  const hariAlpha = Math.random() < 0.12 ? Math.floor(Math.random() * 3) : 0;
  const hariSakit = Math.random() < 0.20 ? Math.floor(Math.random() * 3) : 0;
  const hariCuti  = Math.random() < 0.18 ? Math.floor(Math.random() * 3) : 0;
  const hariHadir = Math.max(15, 22 - hariAlpha - hariSakit - hariCuti);
  return { bulan, tahun, hariHadir, hariSakit, hariCuti, hariAlpha };
}

// ──────────────────────────────────────────────
// PARSER CSV
// ──────────────────────────────────────────────
async function parseCSV(filePath: string): Promise<Record<string, string>[]> {
  const rows: Record<string, string>[] = [];
  const rl = readline.createInterface({
    input: fs.createReadStream(filePath, { encoding: 'utf-8' }),
    crlfDelay: Infinity,
  });

  let headers: string[] = [];
  let isFirst = true;

  for await (const line of rl) {
    if (!line.trim()) continue;

    // Parse CSV dengan dukungan quoted fields
    const values: string[] = [];
    let inQuote = false;
    let current = '';
    for (const char of line) {
      if (char === '"') { inQuote = !inQuote; }
      else if (char === ',' && !inQuote) { values.push(current.trim()); current = ''; }
      else { current += char; }
    }
    values.push(current.trim());

    if (isFirst) {
      // Normalisasi header: "Nomor Telepon" → "nomor_telepon"
      headers = values.map(h =>
        h.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
      );
      isFirst = false;
      continue;
    }

    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = (values[i] || '').trim(); });
    rows.push(row);
  }

  return rows;
}

// ──────────────────────────────────────────────
// MAIN
// ──────────────────────────────────────────────
async function main() {
  const isPreview = process.argv.includes('--preview');
  const currentDate = new Date();
  const bulan = currentDate.getMonth() + 1;
  const tahun = currentDate.getFullYear();

  // Cek file
  if (!fs.existsSync(CSV_FILE_PATH)) {
    console.error(`\n❌ File tidak ditemukan: ${CSV_FILE_PATH}\n`);
    process.exit(1);
  }

  console.log(`\n📂 Membaca: ${CSV_FILE_PATH}`);
  const rows = await parseCSV(CSV_FILE_PATH);
  console.log(`✅ Total baris: ${rows.length}\n`);

  if (rows.length === 0) {
    console.error('❌ CSV kosong.');
    process.exit(1);
  }

  // Tampilkan header yang terdeteksi
  const detectedHeaders = Object.keys(rows[0]);
  console.log('📋 Kolom CSV terdeteksi:');
  console.log('  ', detectedHeaders.join(' | '), '\n');

  // ── TRANSFORMASI DATA ──
  const emailSet = new Set<string>();
  const karyawanList = rows.map((row, index) => {
    // Baca ID dari kolom 'ID Karyawan' (header dinormalisasi → 'id_karyawan')
    const idKaryawan = (row['id_karyawan'] || '').trim() || `KRY-${String(index + 1).padStart(3, '0')}`;

    // Check if new CSV fields exist, otherwise fall back to old CSV format
    const nama = row['nama_karyawan'] || row['nama'] || `Karyawan ${index + 1}`;
    const email_raw = row['email'] || '';
    const jabatan = row['jabatan'] || 'Staff';
    const statusKerja = (row['status_kerja'] || '').toUpperCase() === 'KONTRAK' ? 'KONTRAK' : 'TETAP';
    const gajiPokok = parseGaji(row['gaji_pokok'] || row['gaji'] || '');
    const tunjanganJabatan = parseGaji(row['tunjangan_jabatan'] || '');
    const namaBank = row['bank'] || row['nama_bank'] || 'BCA';
    const nomorRekening = row['no_rekening'] || row['nomor_rekening'] || generateNoRek();

    // Attendance data parsed from the CSV row, or fall back to generateKehadiran
    const hasKehadiran = row['hari_hadir'] !== undefined;
    const hariHadir = hasKehadiran ? parseInt(row['hari_hadir']) || 0 : undefined;
    const hariSakit = hasKehadiran ? parseInt(row['hari_sakit']) || 0 : undefined;
    const hariCuti = hasKehadiran ? parseInt(row['hari_cuti']) || 0 : undefined;
    const hariAlpha = hasKehadiran ? parseInt(row['hari_alpha']) || 0 : undefined;
    const jamLembur = hasKehadiran ? parseInt(row['jam_lembur']) || 0 : undefined;

    // Handle duplikat email
    let email = email_raw || `karyawan${index + 1}@nappz.co.id`;
    if (emailSet.has(email)) {
      email = email.replace('@', `.${index}@`);
    }
    emailSet.add(email);

    return {
      _id: idKaryawan,
      nama: nama.trim(),
      email,
      jabatan: jabatan.trim(),
      statusKerja,
      gajiPokok,
      tunjanganJabatan: tunjanganJabatan || hitungTunjangan(gajiPokok, jabatan),
      namaBank: namaBank || tentukanBank(jabatan),
      nomorRekening,
      password: DEFAULT_PASSWORD,
      _kehadiran: hasKehadiran ? {
        hariHadir,
        hariSakit,
        hariCuti,
        hariAlpha,
        jamLembur,
      } : undefined,
    };
  });

  // ── PREVIEW ──
  console.log('👀 Preview transformasi (5 data pertama):');
  console.log('─'.repeat(65));
  karyawanList.slice(0, 5).forEach((k, i) => {
    console.log(`[${i + 1}] ${k.nama.padEnd(28)} | ${k.jabatan.padEnd(15)} | ${k.statusKerja}`);
    console.log(`    Gaji: Rp ${k.gajiPokok.toLocaleString('id-ID').padEnd(14)} | Tunjangan: Rp ${k.tunjanganJabatan.toLocaleString('id-ID')}`);
    console.log(`    Bank: ${k.namaBank} | Rek: ${k.nomorRekening} | ${k.email}`);
    if (k._kehadiran) {
      console.log(`    Absensi: Hadir ${k._kehadiran.hariHadir} | Sakit ${k._kehadiran.hariSakit} | Cuti ${k._kehadiran.hariCuti} | Alpha ${k._kehadiran.hariAlpha} | Lembur ${k._kehadiran.jamLembur} jam`);
    }
    console.log('');
  });
  console.log('─'.repeat(65));
  console.log(`📊 Total karyawan siap diimport: ${karyawanList.length}`);

  if (isPreview) {
    console.log('\n✅ [PREVIEW MODE] Tidak ada yang diinsert ke database.');
    console.log('   Jalankan "npm run db:import" untuk import sesungguhnya.\n');
    return;
  }

  // ── CONNECT DB ──
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('\n❌ DATABASE_URL tidak ditemukan di .env\n');
    process.exit(1);
  }

  console.log('\n🔌 Menghubungkan ke database...');
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter }) as any;

  try {
    // Hapus data lama
    console.log('🗑️  Membersihkan data lama...');
    await prisma.penggajian.deleteMany({});
    await prisma.kehadiran.deleteMany({});
    await prisma.karyawan.deleteMany({});

    // Pastikan admin ada
    const adminExists = await prisma.admin.findFirst();
    if (!adminExists) {
      await prisma.admin.create({
        data: { nama: 'Administrator', email: 'admin@gajikita.com', password: 'passwordadmin' },
      });
      console.log('✅ Admin default dibuat');
    }

    // ── INSERT (OPTIMIZED BULK INSERT) ──
    console.log(`\n📥 Mengimport ${karyawanList.length} karyawan ke database...\n`);
    const karyawanDataList: any[] = [];
    const kehadiranDataList: any[] = [];

    karyawanList.forEach((k) => {
      // Destructure: pisahkan field sementara sebelum insert
      const { _kehadiran, _id, ...dataInsert } = k;
      // Gunakan ID dari dataset CSV (misal KRY-001), fallback ke UUID jika kosong
      const karyawanId = _id || randomUUID();

      karyawanDataList.push({
        id: karyawanId,
        ...dataInsert,
      });

      kehadiranDataList.push({
        karyawanId,
        bulan,
        tahun,
        ...( _kehadiran || generateKehadiran(bulan, tahun) ),
      });
    });

    // Eksekusi Bulk Insert (Hanya 2 query!)
    await prisma.karyawan.createMany({
      data: karyawanDataList,
    });

    await prisma.kehadiran.createMany({
      data: kehadiranDataList,
    });

    const berhasil = karyawanDataList.length;
    const gagal = 0;


    console.log('\n');
    console.log('═'.repeat(50));
    console.log(`🎉 IMPORT SELESAI!`);
    console.log('─'.repeat(50));
    console.log(`   ✅ Berhasil diimport : ${berhasil} karyawan`);
    if (gagal > 0) console.log(`   ❌ Gagal            : ${gagal} karyawan`);
    console.log(`   📅 Kehadiran bulan ${bulan}/${tahun} dibuat otomatis`);
    console.log(`   🔑 Password login    : ${DEFAULT_PASSWORD}`);
    console.log(`   👤 Admin login       : admin@gajikita.com / passwordadmin`);
    console.log('═'.repeat(50) + '\n');

  } catch (err: any) {
    console.error('\n❌ Error saat import:', err.message);
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
