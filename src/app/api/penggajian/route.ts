/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hitungGajiKaryawan } from '@/utils/salaryCalculator';

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

    const rekapGaji = await prisma.penggajian.findMany({
      where: { bulan, tahun },
      include: {
        karyawan: true,
      },
      orderBy: { karyawan: { nama: 'asc' } },
    });

    return NextResponse.json(rekapGaji);
  } catch (error: any) {
    console.error('Gagal mengambil rekap gaji:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bulan, tahun } = body;

    if (bulan === undefined || tahun === undefined) {
      return NextResponse.json(
        { error: 'Bulan dan tahun wajib ditentukan' },
        { status: 400 }
      );
    }

    const b = parseInt(bulan);
    const t = parseInt(tahun);

    // Ambil semua karyawan beserta absensinya pada bulan/tahun terkait
    const daftarKaryawan = await prisma.karyawan.findMany({
      include: {
        kehadiran: {
          where: { bulan: b, tahun: t },
        },
      },
    });

    if (daftarKaryawan.length === 0) {
      return NextResponse.json(
        { error: 'Belum ada data karyawan. Tambahkan data karyawan terlebih dahulu.' },
        { status: 400 }
      );
    }

    const rekapProses = [];

    for (const kar of daftarKaryawan) {
      // Dapatkan data kehadiran atau gunakan default (Hadir penuh)
      const absensi = kar.kehadiran[0] || {
        hariHadir: 22,
        hariSakit: 0,
        hariCuti: 0,
        hariAlpha: 0,
      };

      const breakdown = hitungGajiKaryawan(kar.gajiPokok, kar.tunjanganJabatan, absensi);

      // Upsert data penggajian
      const gaji = await prisma.penggajian.upsert({
        where: {
          karyawanId_bulan_tahun: {
            karyawanId: kar.id,
            bulan: b,
            tahun: t,
          },
        },
        update: {
          gajiPokok: breakdown.gajiPokok,
          totalTunjangan: breakdown.tunjanganJabatan + breakdown.tunjanganKehadiran,
          totalPotongan: breakdown.potonganKehadiran + breakdown.bpjsKesehatan + breakdown.bpjsKetenagakerjaan,
          pajakPPh21: breakdown.pajakPPh21Sebulan,
          gajiBersih: breakdown.gajiBersih,
        },
        create: {
          karyawanId: kar.id,
          bulan: b,
          tahun: t,
          gajiPokok: breakdown.gajiPokok,
          totalTunjangan: breakdown.tunjanganJabatan + breakdown.tunjanganKehadiran,
          totalPotongan: breakdown.potonganKehadiran + breakdown.bpjsKesehatan + breakdown.bpjsKetenagakerjaan,
          pajakPPh21: breakdown.pajakPPh21Sebulan,
          gajiBersih: breakdown.gajiBersih,
          statusPembayaran: 'TERTUNDA',
        },
        include: {
          karyawan: true,
        },
      });

      rekapProses.push(gaji);
    }

    return NextResponse.json({
      message: `Berhasil memproses gaji untuk ${rekapProses.length} karyawan.`,
      rekapGaji: rekapProses,
    });
  } catch (error: any) {
    console.error('Gagal memproses penggajian:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bulanStr = searchParams.get('bulan');
    const tahunStr = searchParams.get('tahun');
    const semua = searchParams.get('semua');

    let where: Record<string, unknown> = {};

    if (semua === '1') {
      // Hapus SEMUA data penggajian
      where = {};
    } else if (bulanStr && tahunStr) {
      // Hapus hanya periode bulan+tahun tertentu
      where = { bulan: parseInt(bulanStr), tahun: parseInt(tahunStr) };
    } else {
      return NextResponse.json(
        { error: 'Harap sertakan parameter bulan & tahun, atau semua=1 untuk hapus semua data.' },
        { status: 400 }
      );
    }

    const deleted = await prisma.penggajian.deleteMany({ where });

    return NextResponse.json({
      message: semua === '1'
        ? `Berhasil menghapus seluruh ${deleted.count} record penggajian.`
        : `Berhasil menghapus ${deleted.count} record penggajian untuk periode yang dipilih.`,
      count: deleted.count,
    });
  } catch (error: any) {
    console.error('Gagal menghapus penggajian:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}

