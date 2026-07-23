/**
 * Logika Perhitungan Gaji Sistem Penggajian Karyawan
 * Menyesuaikan dengan standar BPJS dan Pajak PPh 21 progresif di Indonesia
 */

export interface InputKehadiran {
  hariHadir: number;
  hariSakit: number;
  hariCuti: number;
  hariAlpha: number; // Tanpa keterangan
  jamLembur?: number; // Jam kerja lembur
}

export interface RincianGaji {
  gajiPokok: number;
  tunjanganJabatan: number;
  tunjanganKehadiran: number;     // Rp 50.000 per hari hadir
  gajiLembur: number;             // Uang upah lembur
  gajiKotor: number;              // Total Gaji Kotor
  potonganKehadiran: number;      // Potongan Alpha
  bpjsKesehatan: number;          // Potongan BPJS Kes (1%)
  bpjsKetenagakerjaan: number;    // Potongan BPJS Tk JHT (2%)
  totalPotonganSebelumPajak: number;
  pkpSetahun: number;             // Penghasilan Kena Pajak per tahun
  pajakPPh21Setahun: number;      // PPh 21 per tahun
  pajakPPh21Sebulan: number;      // PPh 21 per bulan
  totalPotongan: number;          // Total potongan (absensi + BPJS + PPh 21)
  gajiBersih: number;             // Gaji Bersih (Take Home Pay)
}

const HARI_KERJA_STANDAR = 22;
const TUNJANGAN_HADIR_PER_HARI = 50000; // Rp 50.000 per hari hadir
const PTKP_TK0 = 54000000; // PTKP Single/Tidak Kawin Tanpa Tanggungan (TK/0): Rp 54.000.000 per tahun

/**
 * Menghitung Pajak PPh 21 Progresif berdasarkan PKP Setahun
 * Tarif Pasal 17 UU HPP:
 * - Sampai dengan Rp 60jt: 5%
 * - Di atas Rp 60jt s.d Rp 250jt: 15%
 * - Di atas Rp 250jt s.d Rp 500jt: 25%
 * - Di atas Rp 500jt s.d Rp 5M: 30%
 * - Di atas Rp 5M: 35%
 */
export function hitungPajakProgresif(pkp: number): number {
  if (pkp <= 0) return 0;

  let pajak = 0;
  let sisa = pkp;

  // Bracket 1: 5% sampai Rp 60.000.000
  const limit1 = 60000000;
  if (sisa > limit1) {
    pajak += limit1 * 0.05;
    sisa -= limit1;
  } else {
    pajak += sisa * 0.05;
    return pajak;
  }

  // Bracket 2: 15% s.d Rp 250.000.000 (selisih limit: 190.000.000)
  const limit2 = 190000000;
  if (sisa > limit2) {
    pajak += limit2 * 0.15;
    sisa -= limit2;
  } else {
    pajak += sisa * 0.15;
    return pajak;
  }

  // Bracket 3: 25% s.d Rp 500.000.000 (selisih limit: 250.000.000)
  const limit3 = 250000000;
  if (sisa > limit3) {
    pajak += limit3 * 0.25;
    sisa -= limit3;
  } else {
    pajak += sisa * 0.25;
    return pajak;
  }

  // Bracket 4: 30% s.d Rp 5.000.000.000 (selisih limit: 4.500.000.000)
  const limit4 = 4500000000;
  if (sisa > limit4) {
    pajak += limit4 * 0.30;
    sisa -= limit4;
  } else {
    pajak += sisa * 0.30;
    return pajak;
  }

  // Bracket 5: 35% di atas Rp 5.000.000.000
  pajak += sisa * 0.35;
  return pajak;
}

/**
 * Menghitung gaji lengkap untuk karyawan
 */
export function hitungGajiKaryawan(
  gajiPokok: number,
  tunjanganJabatan: number,
  kehadiran: InputKehadiran,
  tarifLemburPerJam: number = 30000
): RincianGaji {
  // 1. Tunjangan Kehadiran & Lembur
  const tunjanganKehadiran = kehadiran.hariHadir * TUNJANGAN_HADIR_PER_HARI;
  const jamLembur = kehadiran.jamLembur || 0;
  const gajiLembur = jamLembur * tarifLemburPerJam;
  const gajiKotor = gajiPokok + tunjanganJabatan + tunjanganKehadiran + gajiLembur;

  // 2. Potongan Absensi (Proposional Hari Alpha)
  const potonganKehadiran = gajiPokok > 0
    ? Math.round((gajiPokok / HARI_KERJA_STANDAR) * kehadiran.hariAlpha)
    : 0;

  // 3. Potongan BPJS (Tanggungan Pekerja)
  // BPJS Kesehatan = 1% dari Gaji Pokok
  const bpjsKesehatan = Math.round(gajiPokok * 0.01);
  // BPJS Ketenagakerjaan (JHT) = 2% dari Gaji Pokok
  const bpjsKetenagakerjaan = Math.round(gajiPokok * 0.02);

  const totalPotonganSebelumPajak = potonganKehadiran + bpjsKesehatan + bpjsKetenagakerjaan;

  // 4. Pajak PPh 21
  // Biaya Jabatan = 5% dari Gaji Kotor, maksimal Rp 500.000 per bulan
  const biayaJabatanSebulan = Math.min(gajiKotor * 0.05, 500000);
  
  // Penghasilan Netto Sebulan (untuk estimasi pajak)
  const nettoSebulan = gajiKotor - bpjsKetenagakerjaan - biayaJabatanSebulan;
  const nettoSetahun = Math.max(0, nettoSebulan * 12);

  // PKP Setahun = Netto Setahun - PTKP (TK/0 standard)
  const pkpSetahun = Math.max(0, nettoSetahun - PTKP_TK0);
  const pajakPPh21Setahun = hitungPajakProgresif(pkpSetahun);
  const pajakPPh21Sebulan = Math.round(pajakPPh21Setahun / 12);

  // 5. Total & Gaji Bersih
  const totalPotongan = totalPotonganSebelumPajak + pajakPPh21Sebulan;
  const gajiBersih = Math.max(0, gajiKotor - totalPotongan);

  return {
    gajiPokok,
    tunjanganJabatan,
    tunjanganKehadiran,
    gajiLembur,
    gajiKotor,
    potonganKehadiran,
    bpjsKesehatan,
    bpjsKetenagakerjaan,
    totalPotonganSebelumPajak,
    pkpSetahun,
    pajakPPh21Setahun,
    pajakPPh21Sebulan,
    totalPotongan,
    gajiBersih,
  };
}
