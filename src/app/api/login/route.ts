import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan kata sandi wajib diisi' },
        { status: 400 }
      );
    }

    const lowerEmail = email.toLowerCase();

    // 1. Cek tabel Admin
    const admin = await prisma.admin.findFirst({
      where: {
        email: {
          equals: lowerEmail,
          mode: 'insensitive',
        },
      },
    });

    if (admin) {
      if (admin.password === password) {
        return NextResponse.json({
          user: {
            email: admin.email,
            role: 'ADMIN',
            nama: admin.nama,
          },
        });
      } else {
        return NextResponse.json(
          { error: 'Kata sandi admin salah' },
          { status: 401 }
        );
      }
    }

    // 2. Cek tabel Karyawan
    const karyawan = await prisma.karyawan.findFirst({
      where: {
        email: {
          equals: lowerEmail,
          mode: 'insensitive',
        },
      },
    });

    if (karyawan) {
      if (karyawan.password === password) {
        return NextResponse.json({
          user: {
            id: karyawan.id,
            email: karyawan.email,
            nama: karyawan.nama,
            role: 'KARYAWAN',
          },
        });
      } else {
        return NextResponse.json(
          { error: 'Kata sandi karyawan salah' },
          { status: 401 }
        );
      }
    }

    // Jika tidak ditemukan di manapun
    return NextResponse.json(
      { error: 'Email tidak terdaftar' },
      { status: 401 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: msg },
      { status: 500 }
    );
  }
}
