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

    const clearOption = formData.get('clearExisting') === 'true';
    if (clearOption) {
      await prisma.penggajian.deleteMany({});
      await prisma.kehadiran.deleteMany({});
      await prisma.karyawan.deleteMany({});
    }

    // Ambil daftar karyawan eksis untuk matching berdasarkan email jika clearExisting false
    const existingKaryawanList = clearOption
      ? []
      : await prisma.karyawan.findMany({ select: { id: true, email: true } });

    const existingMap = new Map<string, string>(
      existingKaryawanList.map((k) => [k.email.toLowerCase(), k.id])
    );

    const emailSet = new Set<string>();
    const toCreateKaryawan: any[] = [];
    const toUpdateKaryawan: { id: string; data: any }[] = [];
    const toInsertKehadiran: any[] = [];
    const affectedKaryawanIds: string[] = [];

    rows.forEach((row, index) => {
      const nama = row['nama_karyawan'] || row['nama'] || row['name'] || `Karyawan ${index + 1}`;
      const email_raw = row['email'] || row['email_karyawan'] || '';
      const jabatan = row['jabatan'] || row['posisi'] || row['position'] || row['divisi'] || 'Staff';

      const statusKerjaRaw = (row['status_kerja'] || row['status'] || '').toUpperCase();
      const statusKerja = (statusKerjaRaw === 'KONTRAK' || statusKerjaRaw === 'TETAP')
        ? (statusKerjaRaw as 'TETAP' | 'KONTRAK')
        : tentukanStatus(jabatan);

      const gajiPokok = parseGaji(row['gaji_pokok'] || row['gaji'] || row['salary'] || '');
      const tunjanganRaw = row['tunjangan_jabatan'] || row['tunjangan'] || '';
      const tunjanganJabatan = tunjanganRaw ? parseGaji(tunjanganRaw) : hitungTunjangan(gajiPokok, jabatan);
      const namaBank = row['bank'] || row['nama_bank'] || tentukanBank(row['departemen'] || '');
      const nomorRekening = row['no_rekening'] || row['nomor_rekening'] || row['rekening'] || generateNoRek();

      // Penanganan duplikat email dalam satu file CSV
      let email = email_raw.toLowerCase().trim() || `karyawan${index + 1}@nappz.co.id`;
      if (emailSet.has(email)) {
        email = email.replace('@', `.${index}@`);
      }
      emailSet.add(email);

      // Pembacaan data Kehadiran / Absensi dari CSV jika ada
      const hasHariHadir = row['hari_hadir'] !== undefined && row['hari_hadir'] !== '';
      const hariHadir = hasHariHadir ? parseInt(row['hari_hadir'].replace(/[^0-9]/g, '')) || 0 : 0;
      const hariSakit = row['hari_sakit'] !== undefined && row['hari_sakit'] !== '' ? parseInt(row['hari_sakit'].replace(/[^0-9]/g, '')) || 0 : 0;
      const hariCuti = row['hari_cuti'] !== undefined && row['hari_cuti'] !== '' ? parseInt(row['hari_cuti'].replace(/[^0-9]/g, '')) || 0 : 0;
      const hariAlpha = row['hari_alpha'] !== undefined && row['hari_alpha'] !== '' ? parseInt(row['hari_alpha'].replace(/[^0-9]/g, '')) || 0 : 0;

      const jamLemburRaw = row['jam_lembur'] || row['lembur'] || row['overtime_hours'] || row['jamLembur'] || '';
      const jamLembur = parseInt(jamLemburRaw.replace(/[^0-9]/g, '')) || 0;

      const kehData = hasHariHadir
        ? { bulan, tahun, hariHadir, hariSakit, hariCuti, hariAlpha, jamLembur }
        : generateKehadiran(bulan, tahun, jamLembur);

      const existingId = existingMap.get(email);

      if (existingId) {
        // Karyawan sudah ada: update data karyawan
        toUpdateKaryawan.push({
          id: existingId,
          data: {
            nama: nama.trim(),
            jabatan: jabatan.trim(),
            statusKerja,
            gajiPokok,
            tunjanganJabatan,
            namaBank,
            nomorRekening,
          },
        });
        affectedKaryawanIds.push(existingId);
        toInsertKehadiran.push({ karyawanId: existingId, ...kehData });
      } else {
        // Karyawan baru: buat ID baru atau pakai ID Karyawan dari CSV jika ada
        const customId = (row['id_karyawan'] || row['id'] || '').trim();
        const karyawanId = customId ? customId : randomUUID();

        toCreateKaryawan.push({
          id: karyawanId,
          nama: nama.trim(),
          email,
          jabatan: jabatan.trim(),
          statusKerja,
          gajiPokok,
          tunjanganJabatan,
          namaBank,
          nomorRekening,
          password: DEFAULT_PASSWORD,
        });
        affectedKaryawanIds.push(karyawanId);
        toInsertKehadiran.push({ karyawanId, ...kehData });
      }
    });

    // 1. Bulk Insert Karyawan Baru
    if (toCreateKaryawan.length > 0) {
      await prisma.karyawan.createMany({
        data: toCreateKaryawan,
        skipDuplicates: true,
      });
    }

    // 2. Update Data Karyawan Eksis (jika ada)
    for (const item of toUpdateKaryawan) {
      await prisma.karyawan.update({
        where: { id: item.id },
        data: item.data,
      });
    }

    // 3. Perbarui Kehadiran Karyawan untuk Bulan & Tahun Ini
    if (affectedKaryawanIds.length > 0) {
      await prisma.kehadiran.deleteMany({
        where: {
          bulan,
          tahun,
          karyawanId: { in: affectedKaryawanIds },
        },
      });

      await prisma.kehadiran.createMany({
        data: toInsertKehadiran,
        skipDuplicates: true,
      });
    }

    const totalProcessed = toCreateKaryawan.length + toUpdateKaryawan.length;

    return NextResponse.json({
      message: `Berhasil meng-import dataset (${toCreateKaryawan.length} baru, ${toUpdateKaryawan.length} diperbarui).`,
      summary: {
        totalCsvRows: rows.length,
        berhasil: totalProcessed,
        dibuat: toCreateKaryawan.length,
        diperbarui: toUpdateKaryawan.length,
        gagal: 0,
        bulan,
        tahun,
      },
    });

  } catch (error: any) {
    console.error('Gagal memproses file upload:', error);
    return NextResponse.json({ error: 'Gagal memproses dataset: ' + (error.message || 'Internal Server Error') }, { status: 500 });
  }
}


