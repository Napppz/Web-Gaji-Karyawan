# DOKUMENTASI TEKNIS - SISTEM PENGGAJIAN GAJIKITA
**Skema Sertifikasi: Analis Program (SKM-2019-62010-02)**

Dokumen ini disusun untuk menjelaskan arsitektur perangkat lunak, keputusan desain basis data, implementasi algoritma perpajakan, dan metodologi pengujian untuk memenuhi seluruh Unit Kompetensi dalam Sertifikasi Analis Program.

---

## 1. Analisis Skalabilitas Perangkat Lunak (J.620100.002.01)

Sistem Informasi Penggajian GajiKita dirancang menggunakan arsitektur modern Next.js App Router yang mendukung skalabilitas horizontal dan vertikal:
* **Serverless Compute**: Menghilangkan beban pengelolaan server fisik. Waktu pemrosesan API diskalakan secara otomatis berdasarkan beban lalu lintas request.
* **Database Connection Pooling**: Karena menggunakan Neon serverless database, sistem ini mengimplementasikan kueri melalui pool koneksi terkelola (`pg` pool). Hal ini mencegah penumpukan koneksi database saat ratusan prosesor payroll memproses penggajian secara simultan.
* **Optimasi Render Sisi Klien (CSR)**: Halaman analitik dan manajemen menggunakan fetching dinamis sisi klien (`useEffect`) dengan caching state. Hal ini mengurangi beban kerja CPU server, sehingga server Next.js hanya fokus melayani data JSON mentah yang sangat ringan.

---

## 2. Akses Basis Data & Penggunaan SQL (J.620100.020.02 / J.620100.021.02)

Aplikasi ini menggunakan PostgreSQL terkelola di **Neon Cloud** dengan **Prisma ORM** sebagai jembatan data.
* **Skema Relasional**:
  * Relasi Satu-ke-Banyak (*One-to-Many*) antara tabel `Karyawan` dengan `Kehadiran`.
  * Relasi Satu-ke-Banyak (*One-to-Many*) antara tabel `Karyawan` dengan `Penggajian`.
* **Indeks & Integritas Kueri**:
  * Indeks unik gabungan `@@unique([karyawanId, bulan, tahun])` pada tabel `Kehadiran` dan `Penggajian`. Ini memastikan integritas data agar tidak terjadi duplikasi entri gaji atau absensi karyawan pada periode bulan/tahun yang sama.
  * Penghapusan Berjenjang (`onDelete: Cascade`) diterapkan secara otomatis pada kunci asing (*foreign key*) relasi karyawan. Ketika data profil karyawan dihapus, database PostgreSQL secara otomatis membersihkan rekam jejak absensi dan penggajian yang berkaitan secara instan untuk menjaga konsistensi data.

---

## 3. Algoritma Perhitungan Gaji & PPh 21 (J.620100.022.02)

Logika perhitungan slip gaji diimplementasikan secara terisolasi pada modul utilitas TypeScript di [salaryCalculator.ts](file:///c:/Users/PC/Documents/Projekl/Web-Gaji-Karyawan/src/utils/salaryCalculator.ts):
1. **Gaji Kotor** = Gaji Pokok + Tunjangan Jabatan + Tunjangan Kehadiran (Rp 50.000 × hari hadir).
2. **Potongan Absensi** = (Gaji Pokok / 22 hari kerja standar) × hari absen alpha.
3. **Iuran BPJS Ketenagakerjaan JHT** = 2% dari Gaji Pokok.
4. **Iuran BPJS Kesehatan** = 1% dari Gaji Pokok.
5. **Pajak Penghasilan (PPh 21) Progresif**:
   * **Pengampunan Pajak**: Dikurangi Biaya Jabatan (5% dari gaji kotor, maksimal Rp 500.000 sebulan) dan BPJS JHT.
   * **PTKP (Penghasilan Tidak Kena Pajak)**: Menggunakan standar dasar Indonesia TK/0 sebesar Rp 54.000.000 per tahun.
   * **Tarif Pajak Pasal 17 UU HPP**:
     * Pendapatan Kena Pajak (PKP) ≤ Rp 60 Juta setahun dikenakan tarif **5%**.
     * Rp 60 Juta < PKP ≤ Rp 250 Juta setahun dikenakan tarif **15%**.
     * Rp 250 Juta < PKP ≤ Rp 500 Juta setahun dikenakan tarif **25%**.
     * Rp 500 Juta < PKP ≤ Rp 5 Miliar setahun dikenakan tarif **30%**.
     * PKP > Rp 5 Miliar setahun dikenakan tarif **35%**.

---

## 4. Metodologi Pengujian Unit (J.620100.033.02)

Pengujian unit (*Unit Testing*) dijalankan secara otomatis menggunakan framework **Vitest** untuk memvalidasi presisi matematika perhitungan pajak dan gaji bersih:
* File Test: [salaryCalculator.test.ts](file:///c:/Users/PC/Documents/Projekl/Web-Gaji-Karyawan/src/utils/salaryCalculator.test.ts)
* Kasus Uji mencakup:
  * Penghitungan pajak bernilai 0 untuk pendapatan di bawah PTKP.
  * Uji komputasi persentase progresif multi-bracket (melewati batas Rp 60.000.000).
  * Uji denda pemotongan hari alpha.
* Perintah Eksekusi:
  ```bash
  npm run test
  ```

---

## 5. Panduan Menjalankan Program untuk Asesor

### Langkah A: Setup Environment (.env)
Pastikan berkas `.env` di root direktori telah terisi koneksi Neon PostgreSQL:
```env
DATABASE_URL="postgresql://neondb_owner:npg_omMDv71qZsFk@ep-dark-rain-aoxbunw9-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

### Langkah B: Sinkronisasi Database
Kueri migrasi skema tabel relasional ke Neon:
```bash
npm run db:push
```

### Langkah C: Memasukkan Data Awal (Seeding)
Masukkan 5 data profil karyawan dan 4 data absensi otomatis:
```bash
npm run db:seed
```

### Langkah D: Menjalankan Server Lokal
Jalankan Next.js development server:
```bash
npm run dev
```
Akses sistem penggajian di browser pada alamat **http://localhost:3000**.
* **Akun Admin Login**: `admin@gajikita.com`
* **Kata Sandi**: `passwordadmin`
