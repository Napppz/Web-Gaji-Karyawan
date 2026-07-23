import { describe, it, expect } from 'vitest';
import { hitungPajakProgresif, hitungGajiKaryawan } from './salaryCalculator';

describe('hitungPajakProgresif', () => {
  it('harus mengembalikan pajak 0 jika PKP <= 0', () => {
    expect(hitungPajakProgresif(0)).toBe(0);
    expect(hitungPajakProgresif(-100000)).toBe(0);
  });

  it('harus menghitung pajak 5% untuk PKP hingga Rp 60.000.000', () => {
    // 5% dari 10.000.000 = 500.000
    expect(hitungPajakProgresif(10000000)).toBe(500000);
    // 5% dari 60.000.000 = 3.000.000
    expect(hitungPajakProgresif(60000000)).toBe(3000000);
  });

  it('harus menerapkan tarif progresif untuk PKP di atas Rp 60.000.000', () => {
    // PKP = 100.000.000
    // Lapis 1: 5% dari 60.000.000 = 3.000.000
    // Lapis 2: 15% dari (100.000.000 - 60.000.000) = 15% dari 40.000.000 = 6.000.000
    // Total = 9.000.000
    expect(hitungPajakProgresif(100000000)).toBe(9000000);
  });
});

describe('hitungGajiKaryawan', () => {
  it('harus menangani kasus gaji pokok dan tunjangan bernilai nol', () => {
    const hasil = hitungGajiKaryawan(0, 0, {
      hariHadir: 20,
      hariSakit: 0,
      hariCuti: 0,
      hariAlpha: 0,
    });
    expect(hasil.gajiPokok).toBe(0);
    expect(hasil.gajiBersih).toBe(1000000); // Hanya mendapat tunjangan kehadiran: 20 * 50.000 = 1.000.000. Potongan 0.
  });

  it('harus menghitung nilai gaji dengan benar untuk karyawan standar', () => {
    // Gaji Pokok: Rp 8.000.000. Tunjangan Jabatan: Rp 1.500.000
    // Kehadiran: 22 hari hadir, 0 alpha.
    // Gaji Kotor = 8M + 1.5M + 22 * 50rb = 10.6M
    // BPJS Kesehatan = 1% dari 8M = 80rb
    // BPJS Ketenagakerjaan = 2% dari 8M = 160rb
    // Biaya Jabatan = 5% dari 10.6M = 530rb -> dibatasi maks 500rb.
    // Estimasi netto setahun = (10.6M - 160rb - 500rb) * 12 = 9.94M * 12 = 119.28M
    // PKP = 119.28M - 54M (PTKP TK0) = 65.28M
    // PPh 21 Setahun = 5% dari 60M + 15% dari 5.28M = 3M + 792rb = 3.792M
    // PPh 21 Sebulan = 3.792M / 12 = 316.000
    const hasil = hitungGajiKaryawan(8000000, 1500000, {
      hariHadir: 22,
      hariSakit: 0,
      hariCuti: 0,
      hariAlpha: 0,
    });

    expect(hasil.gajiKotor).toBe(10600000);
    expect(hasil.bpjsKesehatan).toBe(80000);
    expect(hasil.bpjsKetenagakerjaan).toBe(160000);
    expect(hasil.pajakPPh21Sebulan).toBe(316000);
    expect(hasil.potonganKehadiran).toBe(0);
    expect(hasil.gajiBersih).toBe(hasil.gajiKotor - (hasil.bpjsKesehatan + hasil.bpjsKetenagakerjaan + hasil.pajakPPh21Sebulan));
  });

  it('harus menghitung potongan alpha/absen dengan benar', () => {
    // Gaji Pokok: Rp 11.000.000. Tunjangan Jabatan: Rp 2.000.000
    // Kehadiran: 18 hari hadir, 2 alpha. (22 hari kerja standar)
    // Potongan absen = (11.000.000 / 22) * 2 = 1.000.000
    const hasil = hitungGajiKaryawan(11000000, 2000000, {
      hariHadir: 18,
      hariSakit: 2,
      hariCuti: 0,
      hariAlpha: 2,
    });

    expect(hasil.potonganKehadiran).toBe(1000000);
  });

  it('harus menghitung gaji lembur dengan benar dan menambahkannya ke gaji kotor', () => {
    // Gaji Pokok: Rp 8.000.000. Tunjangan Jabatan: Rp 1.500.000
    // Kehadiran: 22 hari hadir, 0 alpha, 10 jam lembur.
    // Tarif Lembur: Rp 30.000 / jam -> Total Lembur = 300.000
    // Gaji Kotor = 8M + 1.5M + (22 * 50rb) + 300rb = 10.9M
    const hasil = hitungGajiKaryawan(8000000, 1500000, {
      hariHadir: 22,
      hariSakit: 0,
      hariCuti: 0,
      hariAlpha: 0,
      jamLembur: 10,
    });

    expect(hasil.gajiLembur).toBe(300000);
    expect(hasil.gajiKotor).toBe(10900000);
  });
});
