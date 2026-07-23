/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bulanStr = searchParams.get('bulan');
    const tahunStr = searchParams.get('tahun');

    if (!bulanStr || !tahunStr) {
      return NextResponse.json(
        { error: 'Parameter bulan dan tahun wajib diisi' },
        { status: 400 }
      );
    }

    const bulan = parseInt(bulanStr);
    const tahun = parseInt(tahunStr);

    const daftarKaryawan = await prisma.karyawan.findMany({
      include: {
        kehadiran: {
          where: { bulan, tahun },
        },
      },
      orderBy: { nama: 'asc' },
    });

    const hasil = daftarKaryawan.map((karyawan) => {
      const hadir = karyawan.kehadiran[0] || null;
      return {
        karyawanId: karyawan.id,
        nama: karyawan.nama,
        email: karyawan.email,
        jabatan: karyawan.jabatan,
        gajiPokok: karyawan.gajiPokok,
        tunjanganJabatan: karyawan.tunjanganJabatan,
        kehadiran: hadir
          ? {
              id: hadir.id,
              hariHadir: hadir.hariHadir,
              hariSakit: hadir.hariSakit,
              hariCuti: hadir.hariCuti,
              hariAlpha: hadir.hariAlpha,
              jamLembur: hadir.jamLembur,
            }
          : {
              id: null,
              hariHadir: 0,
              hariSakit: 0,
              hariCuti: 0,
              hariAlpha: 0,
              jamLembur: 0,
            },
      };
    });

    return NextResponse.json(hasil);
  } catch (error: any) {
    console.error('Gagal mengambil data kehadiran:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { karyawanId, bulan, tahun, hariHadir, hariSakit, hariCuti, hariAlpha, jamLembur } = body;

    if (!karyawanId || bulan === undefined || tahun === undefined || hariHadir === undefined || hariSakit === undefined || hariCuti === undefined || hariAlpha === undefined) {
      return NextResponse.json(
        { error: 'Beberapa field wajib diisi' },
        { status: 400 }
      );
    }

    const b = parseInt(bulan);
    const t = parseInt(tahun);
    const hHadir = parseInt(hariHadir);
    const hSakit = parseInt(hariSakit);
    const hCuti = parseInt(hariCuti);
    const hAlpha = parseInt(hariAlpha);
    const jLembur = parseInt(jamLembur) || 0;

    // Pastikan karyawan terdaftar
    const karyawan = await prisma.karyawan.findUnique({
      where: { id: karyawanId },
    });

    if (!karyawan) {
      return NextResponse.json({ error: 'Karyawan tidak ditemukan' }, { status: 404 });
    }

    // Upsert kehadiran
    const kehadiran = await prisma.kehadiran.upsert({
      where: {
        karyawanId_bulan_tahun: {
          karyawanId,
          bulan: b,
          tahun: t,
        },
      },
      update: {
        hariHadir: hHadir,
        hariSakit: hSakit,
        hariCuti: hCuti,
        hariAlpha: hAlpha,
        jamLembur: jLembur,
      },
      create: {
        karyawanId,
        bulan: b,
        tahun: t,
        hariHadir: hHadir,
        hariSakit: hSakit,
        hariCuti: hCuti,
        hariAlpha: hAlpha,
        jamLembur: jLembur,
      },
    });

    return NextResponse.json(kehadiran);
  } catch (error: any) {
    console.error('Gagal memproses kehadiran:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
