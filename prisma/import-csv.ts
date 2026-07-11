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
const CSV_FILE_PATH = path.join(__dirname, 'data', 'karyawan.csv');

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
    // Ambil nilai dari CSV — sesuai kolom dataset Kaggle ini
    const nama        = row['nama']       || `Karyawan ${index + 1}`;
    const jabatan     = row['jabatan']    || 'Staff';
    const gaji        = parseGaji(row['gaji'] || '');
    const email_raw   = row['email']      || '';
    const departemen  = row['departemen'] || '';

    // Hitung tunjangan berdasarkan jabatan
    const tunjanganJabatan = hitungTunjangan(gaji, jabatan);

    // Tentukan bank berdasarkan departemen
    const namaBank = tentukanBank(departemen);

    // Tentukan status kerja
    const statusKerja = tentukanStatus(jabatan);

    // Handle duplikat email
    let email = email_raw || `karyawan${index + 1}@nappz.co.id`;
    if (emailSet.has(email)) {
      email = email.replace('@', `.${index}@`);
    }
    emailSet.add(email);

    return {
      nama: nama.trim(),
      email,
      jabatan: jabatan.trim(),
      statusKerja,
      gajiPokok: gaji,
      tunjanganJabatan,
      namaBank,
      nomorRekening: generateNoRek(),
      password: DEFAULT_PASSWORD,
      // Info tambahan untuk ditampilkan (tidak masuk DB)
      _departemen: departemen,
      _usia: row['usia'] || '-',
    };
  });

  // ── PREVIEW ──
  console.log('👀 Preview transformasi (5 data pertama):');
  console.log('─'.repeat(65));
  karyawanList.slice(0, 5).forEach((k, i) => {
    console.log(`[${i + 1}] ${k.nama.padEnd(28)} | ${k.jabatan.padEnd(15)} | ${k.statusKerja}`);
    console.log(`    Gaji: Rp ${k.gajiPokok.toLocaleString('id-ID').padEnd(14)} | Tunjangan: Rp ${k.tunjanganJabatan.toLocaleString('id-ID')}`);
    console.log(`    Dept: ${k._departemen.padEnd(12)} | Bank: ${k.namaBank} | ${k.email}`);
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
      // Destructure: hilangkan field _departemen & _usia sebelum insert
      const { _departemen: _d, _usia: _u, ...dataInsert } = k;
      const karyawanId = randomUUID();

      karyawanDataList.push({
        id: karyawanId,
        ...dataInsert,
      });

      kehadiranDataList.push({
        karyawanId,
        ...generateKehadiran(bulan, tahun),
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
