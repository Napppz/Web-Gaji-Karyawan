/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const settings = await prisma.pengaturan.findMany();
    // Convert array of settings to a simple key-value object
    const settingsMap = settings.reduce((acc: any, cur: any) => {
      acc[cur.kunci] = cur.nilai;
      return acc;
    }, {});

    // Default fallback values if not set
    if (!settingsMap['JAM_MASUK']) {
      settingsMap['JAM_MASUK'] = '09:00';
    }

    return NextResponse.json(settingsMap);
  } catch (error: any) {
    console.error('Gagal mengambil pengaturan:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { JAM_MASUK } = body;

    if (!JAM_MASUK) {
      return NextResponse.json(
        { error: 'Kunci JAM_MASUK wajib diisi.' },
        { status: 400 }
      );
    }

    // Validate format HH:MM
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(JAM_MASUK)) {
      return NextResponse.json(
        { error: 'Format jam masuk harus HH:MM (misal: 08:30)' },
        { status: 400 }
      );
    }

    // Upsert settings for JAM_MASUK
    const setting = await prisma.pengaturan.upsert({
      where: { kunci: 'JAM_MASUK' },
      update: { nilai: JAM_MASUK },
      create: { kunci: 'JAM_MASUK', nilai: JAM_MASUK },
    });

    return NextResponse.json({
      message: 'Pengaturan berhasil diperbarui!',
      setting,
    });
  } catch (error: any) {
    console.error('Gagal menyimpan pengaturan:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
