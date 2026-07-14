# DOKUMENTASI PROGRAM - APLIKASI PENGGAJIAN KARYAWAN (GAJIKITA)
**Skema Sertifikasi: Analis Program (SKM-2019-62010-02)**

Dokumen ini menjelaskan struktur kode, desain database, algoritma perhitungan gaji/pajak, dan cara pengujian aplikasi GajiKita untuk kebutuhan penilaian sertifikasi.

---

## 1. Analisis & Struktur Aplikasi (J.620100.002.01)

Aplikasi GajiKita dibuat menggunakan Next.js (App Router) dengan fokus pada kemudahan maintenance dan efisiensi resource:
* **Connection Pooling**: Koneksi database PostgreSQL menggunakan connection pool dari library `pg` agar aplikasi tidak crash saat diakses banyak user secara bersamaan.
* **Client-Side Rendering (CSR)**: Halaman dashboard dan input menggunakan CSR untuk meminimalkan beban rendering di sisi server. Server hanya bertugas melayani data API dalam format JSON.

---

## 2. Struktur Database & Akses SQL (J.620100.020.02 / J.620100.021.02)

Penyimpanan data menggunakan database PostgreSQL yang dihubungkan melalui Prisma ORM.

* **Relasi Tabel**:
  * **Karyawan ke Kehadiran**: Relasi One-to-Many (Satu Karyawan memiliki banyak data absensi per bulan).
  * **Karyawan ke Penggajian**: Relasi One-to-Many (Satu Karyawan memiliki banyak slip gaji bulanan).
* **Aturan Database (Integritas Data)**:
  * **Composite Unique Key**: Kombinasi `karyawanId`, `bulan`, dan `tahun` dibuat unik (`@@unique`) agar tidak ada data gaji atau absensi ganda untuk satu karyawan di bulan yang sama.
  * **Cascade Delete**: Jika data Karyawan dihapus, seluruh data absensi dan penggajian yang berhubungan akan terhapus otomatis (`onDelete: Cascade`) untuk menjaga konsistensi database.

---

## 3. Algoritma Perhitungan Gaji & PPh 21 (J.620100.022.02)

Seluruh logika perhitungan gaji dipusatkan pada file `src/utils/salaryCalculator.ts`.

1. **Gaji Kotor**: 
   * Rumus: `Gaji Pokok + Tunjangan Jabatan + Tunjangan Kehadiran (Rp 50.000 × hari hadir)`.
2. **Potongan Kehadiran**:
   * Denda jika karyawan tidak masuk tanpa keterangan (Alpha).
   * Rumus: `(Gaji Pokok / 22 hari kerja) × hari Alpha`.
3. **BPJS**:
   * BPJS Kesehatan: 1% dari Gaji Pokok.
   * BPJS Ketenagakerjaan (JHT): 2% dari Gaji Pokok.
4. **Pajak PPh 21 Progresif**:
   * **Pengurangan Gaji Kotor**: Gaji kotor dikurangi biaya jabatan (5%, maks Rp 500.000) dan iuran BPJS JHT.
   * **PTKP**: Menggunakan tarif PTKP TK/0 (belum menikah, tanpa tanggungan) sebesar Rp 54.000.000 per tahun.
   * **Lapis Tarif Pajak (Pasal 17 UU HPP)**:
     * PKP sampai Rp 60 Juta/tahun = Tarif 5%
     * PKP Rp 60 Juta s/d Rp 250 Juta/tahun = Tarif 15%
     * PKP Rp 250 Juta s/d Rp 500 Juta/tahun = Tarif 25%
     * PKP Rp 500 Juta s/d Rp 5 Miliar/tahun = Tarif 30%
     * PKP di atas Rp 5 Miliar/tahun = Tarif 35%

---

## 4. Pengujian Unit / Unit Testing (J.620100.033.02)

Pengujian logika fungsi perhitungan dilakukan menggunakan framework **Vitest** di file `src/utils/salaryCalculator.test.ts`. 

Pengujian ini mencakup:
* Perhitungan pajak Rp 0 untuk karyawan dengan pendapatan di bawah PTKP.
* Perhitungan pajak progresif dengan tarif berlapis (untuk PKP di atas Rp 60.000.000).
* Akurasi pemotongan denda absensi (Alpha).

Menjalankan pengujian:
```bash
npm run test
```

---

## 5. Panduan Instalasi dan Setup untuk Pengujian

### Langkah 1: Konfigurasi Database (.env)
Buat file `.env` di root folder dan masukkan string koneksi database PostgreSQL Anda:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/payroll"
```

### Langkah 2: Sinkronisasi Skema Database
Kirim skema tabel ke database:
```bash
npm run db:push
```

### Langkah 3: Seeding & Import Data Awal
Untuk memasukkan data user admin dan beberapa karyawan contoh:
```bash
npm run db:seed
```

Untuk mengimport 1.000 dataset karyawan:
```bash
npm run db:import
```

### Langkah 4: Jalankan Aplikasi
Jalankan aplikasi di mode development:
```bash
npm run dev
```
Buka **http://localhost:3000** di browser.
* **Email Admin**: `admin@gajikita.com`
* **Password**: `passwordadmin`
