/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    const currentYear = currentDate.getFullYear();

    // 1. Total Karyawan
    const totalKaryawan = await prisma.karyawan.count();

    // 2. Karyawan status kerja counts
    const permanentCount = await prisma.karyawan.count({ where: { statusKerja: 'TETAP' } });
    const contractCount = await prisma.karyawan.count({ where: { statusKerja: 'KONTRAK' } });

    // 3. Current month payroll summaries
    const payrolls = await prisma.penggajian.findMany({
      where: { bulan: currentMonth, tahun: currentYear },
      include: { karyawan: true },
    });

    const totalSalaryExpense = payrolls.reduce((sum: number, p: any) => sum + p.gajiBersih, 0);
    const paidPayments = payrolls.filter((p: any) => p.statusPembayaran === 'LUNAS').length;
    const pendingPayments = payrolls.filter((p: any) => p.statusPembayaran === 'TERTUNDA').length;
    const averageSalary = payrolls.length > 0 ? Math.round(totalSalaryExpense / payrolls.length) : 0;
    const totalTaxCollected = payrolls.reduce((sum: number, p: any) => sum + p.pajakPPh21, 0);

    // 4. Jabatan distribution
    const karyawanAll = await prisma.karyawan.findMany({
      select: { jabatan: true },
    });
    const deptMap: { [key: string]: number } = {};
    karyawanAll.forEach((kar) => {
      deptMap[kar.jabatan] = (deptMap[kar.jabatan] || 0) + 1;
    });
    const departmentDistribution = Object.keys(deptMap).map((jabatan) => ({
      name: jabatan,
      value: deptMap[jabatan],
    }));

    // 5. Monthly Expense Trend (last 6 months)
    const allPayrolls = await prisma.penggajian.findMany({
      select: { bulan: true, tahun: true, gajiBersih: true },
    });
    const monthlyTrendMap: { [key: string]: number } = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      monthlyTrendMap[`${monthNames[m - 1]} ${y}`] = 0;
    }
    allPayrolls.forEach((p) => {
      const key = `${monthNames[p.bulan - 1]} ${p.tahun}`;
      if (monthlyTrendMap[key] !== undefined) {
        monthlyTrendMap[key] += p.gajiBersih;
      }
    });
    const monthlyExpenseTrend = Object.keys(monthlyTrendMap).map((key) => ({
      month: key,
      expense: monthlyTrendMap[key],
    }));

    // 6. Recent Additions
    const recentEmployees = await prisma.karyawan.findMany({
      orderBy: { dibuatPada: 'desc' },
      take: 4,
    });
    const recentPayrolls = await prisma.penggajian.findMany({
      orderBy: { dibuatPada: 'desc' },
      take: 4,
      include: { karyawan: true },
    });

    // 7. Attendance Summary — current month (realtime from Kehadiran table)
    const allKaryawan = await prisma.karyawan.findMany({
      select: { id: true, nama: true, jabatan: true, statusKerja: true },
      orderBy: { nama: 'asc' },
    });
    const kehadiranBulanIni = await prisma.kehadiran.findMany({
      where: { bulan: currentMonth, tahun: currentYear },
    });
    const kehadiranMap: { [karyawanId: string]: any } = {};
    kehadiranBulanIni.forEach((k) => {
      kehadiranMap[k.karyawanId] = k;
    });
    const attendanceSummary = allKaryawan.map((kar) => {
      const rec = kehadiranMap[kar.id];
      return {
        id: kar.id,
        nama: kar.nama,
        jabatan: kar.jabatan,
        statusKerja: kar.statusKerja,
        hariHadir: rec?.hariHadir ?? 0,
        hariSakit: rec?.hariSakit ?? 0,
        hariCuti: rec?.hariCuti ?? 0,
        hariAlpha: rec?.hariAlpha ?? 0,
      };
    });
    const totalHariHadir = attendanceSummary.reduce((s, k) => s + k.hariHadir, 0);
    const totalHariSakit = attendanceSummary.reduce((s, k) => s + k.hariSakit, 0);
    const totalHariCuti  = attendanceSummary.reduce((s, k) => s + k.hariCuti,  0);
    const totalHariAlpha = attendanceSummary.reduce((s, k) => s + k.hariAlpha, 0);

    return NextResponse.json({
      totalKaryawan,
      permanentCount,
      contractCount,
      totalSalaryExpense,
      paidPayments,
      pendingPayments,
      averageSalary,
      totalTaxCollected,
      departmentDistribution,
      monthlyExpenseTrend,
      recentEmployees,
      recentPayrolls,
      attendanceSummary,
      totalHariHadir,
      totalHariSakit,
      totalHariCuti,
      totalHariAlpha,
      attendanceBulan: currentMonth,
      attendanceTahun: currentYear,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Gagal mengambil ringkasan dashboard:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: errorMessage },
      { status: 500 }
    );
  }
}
