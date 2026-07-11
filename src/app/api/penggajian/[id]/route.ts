/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Ambil data slip gaji
    const gaji = await prisma.penggajian.findUnique({
      where: { id },
      include: {
        karyawan: true,
      },
    });

    if (!gaji) {
      return NextResponse.json({ error: 'Data slip gaji tidak ditemukan' }, { status: 404 });
    }

    // Ambil data absensi yang sesuai pada bulan/tahun terkait
    const absensi = await prisma.kehadiran.findUnique({
      where: {
        karyawanId_bulan_tahun: {
          karyawanId: gaji.karyawanId,
          bulan: gaji.bulan,
          tahun: gaji.tahun,
        },
      },
    });

    return NextResponse.json({
      ...gaji,
      kehadiran: absensi || {
        hariHadir: 22,
        hariSakit: 0,
        hariCuti: 0,
        hariAlpha: 0,
      },
    });
  } catch (error: any) {
    console.error('Gagal mengambil rincian slip gaji:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { statusPembayaran } = body;

    if (!statusPembayaran || !['TERTUNDA', 'LUNAS'].includes(statusPembayaran)) {
      return NextResponse.json(
        { error: 'Format statusPembayaran salah atau kosong' },
        { status: 400 }
      );
    }

    const updatedGaji = await prisma.penggajian.update({
      where: { id },
      data: {
        statusPembayaran,
        dibayarPada: statusPembayaran === 'LUNAS' ? new Date() : null,
      },
      include: {
        karyawan: true,
      },
    });

    return NextResponse.json(updatedGaji);
  } catch (error: any) {
    console.error('Gagal memperbarui status pembayaran gaji:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
