/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email wajib dikirim.' },
        { status: 400 }
      );
    }

    // 1. Cari karyawan berdasarkan email
    const karyawan = await prisma.karyawan.findUnique({
      where: { email },
    });

    if (!karyawan) {
      return NextResponse.json(
        { error: 'Karyawan tidak ditemukan.' },
        { status: 404 }
      );
    }

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    const currentYear = currentDate.getFullYear();

    // 2. Cari record kehadiran untuk bulan ini
    let kehadiran = await prisma.kehadiran.findFirst({
      where: {
        karyawanId: karyawan.id,
        bulan: currentMonth,
        tahun: currentYear,
      },
    });

    if (!kehadiran) {
      // Jika belum ada record absen bulan ini, buat record baru dengan 1 hari hadir
      kehadiran = await prisma.kehadiran.create({
        data: {
          karyawanId: karyawan.id,
          bulan: currentMonth,
          tahun: currentYear,
          hariHadir: 1,
          hariSakit: 0,
          hariCuti: 0,
          hariAlpha: 0,
        },
      });
    } else {
      // Jika sudah ada, tambah hari hadir (maksimal 31 hari)
      if (kehadiran.hariHadir >= 31) {
        return NextResponse.json(
          { error: 'Batas absensi bulan ini sudah maksimum (31 hari).' },
          { status: 400 }
        );
      }

      kehadiran = await prisma.kehadiran.update({
        where: { id: kehadiran.id },
        data: {
          hariHadir: kehadiran.hariHadir + 1,
        },
      });
    }

    return NextResponse.json({
      message: 'Absensi hari ini berhasil dicatat!',
      kehadiran,
    });
  } catch (error: any) {
    console.error('Gagal mencatat absensi karyawan:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
