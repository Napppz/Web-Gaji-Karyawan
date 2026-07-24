/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ──────────────────────────────────────────────
// CONSTANTS & HELPERS
// ──────────────────────────────────────────────
const DEFAULT_PASSWORD = 'karyawan123';

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

const BANK_PER_DEPT: Record<string, string> = {
  'finance'    : 'Mandiri',
  'it'         : 'BCA',
  'sales'      : 'BRI',
  'marketing'  : 'BNI',
  'operations' : 'BCA',
  'hr'         : 'Mandiri',
  'legal'      : 'CIMB',
};

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
  return Math.round(gaji * 0.08);
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

function generateKehadiran(bulan: number, tahun: number, jamLembur = 0) {
  const hariAlpha = Math.random() < 0.12 ? Math.floor(Math.random() * 3) : 0;
  const hariSakit = Math.random() < 0.20 ? Math.floor(Math.random() * 3) : 0;
  const hariCuti  = Math.random() < 0.18 ? Math.floor(Math.random() * 3) : 0;
  const hariHadir = Math.max(15, 22 - hariAlpha - hariSakit - hariCuti);
  return { bulan, tahun, hariHadir, hariSakit, hariCuti, hariAlpha, jamLembur };
}

// Simple browser-compatible CSV text parser
function parseCSVText(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/);
  const rows: Record<string, string>[] = [];
  let headers: string[] = [];
  let isFirst = true;

  for (const line of lines) {
    if (!line.trim()) continue;

    const values: string[] = [];
    let inQuote = false;
    let current = '';
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuote = !inQuote;
      } else if (char === ',' && !inQuote) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    if (isFirst) {
      headers = values.map(h =>
        h.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
      );
      isFirst = false;
      continue;
    }

    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = (values[i] || '').trim();
    });
    rows.push(row);
  }

  return rows;
}

// ──────────────────────────────────────────────
// POST: UPLOAD AND PARSE CSV (OPTIMIZED BULK INSERT)
// ──────────────────────────────────────────────
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'Tidak ada file CSV yang dikirimkan.' }, { status: 400 });
    }

    const text = await file.text();
    const rows = parseCSVText(text);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'File CSV kosong atau tidak memiliki data yang valid.' }, { status: 400 });
    }

    const currentDate = new Date();
    const bulan = currentDate.getMonth() + 1;
    const tahun = currentDate.getFullYear();

    const emailSet = new Set<string>();
    
    // Siapkan list karyawan dan kehadiran dengan pre-generated ID
    const karyawanDataList: any[] = [];
    const kehadiranDataList: any[] = [];

    rows.forEach((row, index) => {
      const nama = row['nama'] || row['nama_karyawan'] || row['name'] || `Karyawan ${index + 1}`;
      const jabatan = row['jabatan'] || row['posisi'] || row['position'] || row['divisi'] || 'Staff';
      const gaji = parseGaji(row['gaji'] || row['gaji_pokok'] || row['salary'] || '');
      const email_raw = row['email'] || row['email_karyawan'] || '';
      const departemen = row['departemen'] || '';

      const tunjanganJabatan = hitungTunjangan(gaji, jabatan);
      const namaBank = tentukanBank(departemen);
      const statusKerja = tentukanStatus(jabatan);

      let email = email_raw || `karyawan${index + 1}@nappz.co.id`;
      if (emailSet.has(email)) {
        email = email.replace('@', `.${index}@`);
      }
      emailSet.add(email);

      // Pre-generate UUID
      const karyawanId = randomUUID();

      karyawanDataList.push({
        id: karyawanId,
        nama: nama.trim(),
        email,
        jabatan: jabatan.trim(),
        statusKerja,
        gajiPokok: gaji,
        tunjanganJabatan,
        namaBank,
        nomorRekening: generateNoRek(),
        password: DEFAULT_PASSWORD,
      });

      // Baca jam lembur dari CSV jika tersedia (kolom: jam_lembur / lembur / overtime_hours)
      const jamLemburRaw = row['jam_lembur'] || row['lembur'] || row['overtime_hours'] || row['jamLembur'] || '';
      const jamLembur = parseInt(jamLemburRaw.replace(/[^0-9]/g, '')) || 0;

      kehadiranDataList.push({
        karyawanId,
        ...generateKehadiran(bulan, tahun, jamLembur),
      });
    });

    // Clear existing tables data optionally
    const clearOption = formData.get('clearExisting') === 'true';
    if (clearOption) {
      await prisma.penggajian.deleteMany({});
      await prisma.kehadiran.deleteMany({});
      await prisma.karyawan.deleteMany({});
    }

    // Eksekusi Bulk Insert (Hanya 2 query!)
    await prisma.karyawan.createMany({
      data: karyawanDataList,
    });

    await prisma.kehadiran.createMany({
      data: kehadiranDataList,
    });

    return NextResponse.json({
      message: `Berhasil mengimport data karyawan secara kilat.`,
      summary: {
        totalCsvRows: rows.length,
        berhasil: karyawanDataList.length,
        gagal: 0,
        bulan,
        tahun
      }
    });

  } catch (error: any) {
    console.error('Gagal memproses file upload:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

