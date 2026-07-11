/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Mengambil riwayat pengajuan izin
// Dapat difilter berdasarkan karyawanId
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const karyawanId = searchParams.get('karyawanId');

    const filter: any = {};
    if (karyawanId) {
      filter.karyawanId = karyawanId;
    }

    const pengajuan = await prisma.pengajuanIzin.findMany({
      where: filter,
      include: {
        karyawan: {
          select: {
            nama: true,
            email: true,
            jabatan: true,
          },
        },
      },
      orderBy: { dibuatPada: 'desc' },
    });

    return NextResponse.json(pengajuan);
  } catch (error: any) {
    console.error('Gagal mengambil data pengajuan izin:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}

// POST: Membuat pengajuan izin baru oleh karyawan
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { karyawanId, jenis, tanggalMulai, tanggalSelesai, keterangan } = body;

    // Validasi dasar
    if (!karyawanId || !jenis || !tanggalMulai || !tanggalSelesai || !keterangan) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi' },
        { status: 400 }
      );
    }

    // Buat pengajuan izin baru
    const pengajuan = await prisma.pengajuanIzin.create({
      data: {
        karyawanId,
        jenis, // SAKIT atau CUTI
        tanggalMulai,
        tanggalSelesai,
        keterangan,
        status: 'PENDING',
      },
    });

    return NextResponse.json(pengajuan, { status: 201 });
  } catch (error: any) {
    console.error('Gagal membuat pengajuan izin:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
