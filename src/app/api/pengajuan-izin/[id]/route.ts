/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body; // DISETUJUI atau DITOLAK

    if (!status || (status !== 'DISETUJUI' && status !== 'DITOLAK')) {
      return NextResponse.json(
        { error: 'Status tidak valid (harus DISETUJUI atau DITOLAK)' },
        { status: 400 }
      );
    }

    // 1. Cari data pengajuan izin
    const pengajuan = await prisma.pengajuanIzin.findUnique({
      where: { id },
    });

    if (!pengajuan) {
      return NextResponse.json(
        { error: 'Pengajuan izin tidak ditemukan' },
        { status: 404 }
      );
    }

    if (pengajuan.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Pengajuan ini sudah diproses sebelumnya' },
        { status: 400 }
      );
    }

    // 2. Jika disetujui, update rekap absensi di database secara otomatis
    if (status === 'DISETUJUI') {
      const start = new Date(pengajuan.tanggalMulai);
      const end = new Date(pengajuan.tanggalSelesai);
      
      // Hitung perbedaan hari (inklusif)
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      const bulan = start.getMonth() + 1; // 1-12
      const tahun = start.getFullYear();

      // Cari rekap kehadiran karyawan pada bulan terkait
      const kehadiran = await prisma.kehadiran.findFirst({
        where: {
          karyawanId: pengajuan.karyawanId,
          bulan,
          tahun,
        },
      });

      if (!kehadiran) {
        // Jika belum ada record kehadiran di bulan tersebut, buat record baru
        await prisma.kehadiran.create({
          data: {
            karyawanId: pengajuan.karyawanId,
            bulan,
            tahun,
            hariHadir: Math.max(0, 22 - diffDays),
            hariSakit: pengajuan.jenis === 'SAKIT' ? diffDays : 0,
            hariCuti: pengajuan.jenis === 'CUTI' ? diffDays : 0,
            hariAlpha: 0,
          },
        });
      } else {
        // Jika sudah ada, update hari sakit/cuti dan kurangkan hari hadir agar seimbang
        const updateData: any = {};
        if (pengajuan.jenis === 'SAKIT') {
          updateData.hariSakit = kehadiran.hariSakit + diffDays;
        } else if (pengajuan.jenis === 'CUTI') {
          updateData.hariCuti = kehadiran.hariCuti + diffDays;
        }
        updateData.hariHadir = Math.max(0, kehadiran.hariHadir - diffDays);

        await prisma.kehadiran.update({
          where: { id: kehadiran.id },
          data: updateData,
        });
      }
    }

    // 3. Update status pengajuan izin
    const updatedPengajuan = await prisma.pengajuanIzin.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({
      message: `Status pengajuan berhasil diubah menjadi ${status}!`,
      pengajuan: updatedPengajuan,
    });
  } catch (error: any) {
    console.error('Gagal memproses persetujuan izin:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Cari data pengajuan izin
    const pengajuan = await prisma.pengajuanIzin.findUnique({
      where: { id },
    });

    if (!pengajuan) {
      return NextResponse.json(
        { error: 'Pengajuan izin tidak ditemukan' },
        { status: 404 }
      );
    }

    // Hapus data pengajuan izin
    await prisma.pengajuanIzin.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Riwayat pengajuan izin berhasil dihapus',
    });
  } catch (error: any) {
    console.error('Gagal menghapus riwayat izin:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
