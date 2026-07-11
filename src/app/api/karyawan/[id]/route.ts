/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const karyawan = await prisma.karyawan.findUnique({
      where: { id },
      include: {
        kehadiran: {
          orderBy: [{ tahun: 'desc' }, { bulan: 'desc' }],
          take: 12,
        },
        penggajian: {
          orderBy: [{ tahun: 'desc' }, { bulan: 'desc' }],
          take: 12,
        },
      },
    });

    if (!karyawan) {
      return NextResponse.json({ error: 'Karyawan tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(karyawan);
  } catch (error: any) {
    console.error('Gagal mengambil detail karyawan:', error);
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
    const { nama, email, password, jabatan, statusKerja, gajiPokok, tunjanganJabatan, nomorRekening, namaBank } = body;

    // Periksa apakah karyawan terdaftar
    const karyawanLama = await prisma.karyawan.findUnique({
      where: { id },
    });

    if (!karyawanLama) {
      return NextResponse.json({ error: 'Karyawan tidak ditemukan' }, { status: 404 });
    }

    // Periksa keunikan email jika email dirubah
    if (email && email !== karyawanLama.email) {
      const emailDup = await prisma.karyawan.findUnique({
        where: { email },
      });
      if (emailDup) {
        return NextResponse.json(
          { error: 'Karyawan dengan email ini sudah terdaftar' },
          { status: 400 }
        );
      }
    }

    const karyawanUpdate = await prisma.karyawan.update({
      where: { id },
      data: {
        nama: nama !== undefined ? nama : undefined,
        email: email !== undefined ? email : undefined,
        password: password !== undefined ? password : undefined,
        jabatan: jabatan !== undefined ? jabatan : undefined,
        statusKerja: statusKerja !== undefined ? statusKerja : undefined,
        gajiPokok: gajiPokok !== undefined ? parseFloat(gajiPokok) : undefined,
        tunjanganJabatan: tunjanganJabatan !== undefined ? parseFloat(tunjanganJabatan) : undefined,
        nomorRekening: nomorRekening !== undefined ? nomorRekening : undefined,
        namaBank: namaBank !== undefined ? namaBank : undefined,
      },
    });

    return NextResponse.json(karyawanUpdate);
  } catch (error: any) {
    console.error('Gagal memperbarui data karyawan:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const karyawan = await prisma.karyawan.findUnique({
      where: { id },
    });

    if (!karyawan) {
      return NextResponse.json({ error: 'Karyawan tidak ditemukan' }, { status: 404 });
    }

    await prisma.karyawan.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Karyawan berhasil dihapus' });
  } catch (error: any) {
    console.error('Gagal menghapus karyawan:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
