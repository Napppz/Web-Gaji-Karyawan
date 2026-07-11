/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const karyawan = await prisma.karyawan.findMany({
      orderBy: { nama: 'asc' },
    });
    return NextResponse.json(karyawan);
  } catch (error: any) {
    console.error('Gagal mengambil data karyawan:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nama, email, password, jabatan, statusKerja, gajiPokok, tunjanganJabatan, nomorRekening, namaBank } = body;

    // Validasi input
    if (!nama || !email || !jabatan || !statusKerja || gajiPokok === undefined || !nomorRekening || !namaBank) {
      return NextResponse.json(
        { error: 'Beberapa field wajib diisi' },
        { status: 400 }
      );
    }

    // Periksa apakah email sudah terdaftar
    const emailTerdaftar = await prisma.karyawan.findUnique({
      where: { email },
    });

    if (emailTerdaftar) {
      return NextResponse.json(
        { error: 'Karyawan dengan email ini sudah terdaftar' },
        { status: 400 }
      );
    }

    const karyawan = await prisma.karyawan.create({
      data: {
        nama,
        email,
        password: password || undefined,
        jabatan,
        statusKerja,
        gajiPokok: parseFloat(gajiPokok),
        tunjanganJabatan: tunjanganJabatan ? parseFloat(tunjanganJabatan) : 0,
        nomorRekening,
        namaBank,
      },
    });

    return NextResponse.json(karyawan, { status: 201 });
  } catch (error: any) {
    console.error('Gagal menambahkan karyawan:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await prisma.penggajian.deleteMany({});
    await prisma.kehadiran.deleteMany({});
    const deleted = await prisma.karyawan.deleteMany({});
    return NextResponse.json({ message: `Berhasil menghapus seluruh ${deleted.count} karyawan.` });
  } catch (error: any) {
    console.error('Gagal menghapus semua karyawan:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}

