# 💼 Web Gaji Karyawan (GajiKita)
> **Sistem Informasi Penggajian Karyawan & Kalkulasi PPh 21 Progresif**
> *Diperuntukkan untuk Sertifikasi Kompetensi Analis Program (BNSP)*

Aplikasi berbasis web untuk otomasi perhitungan penggajian karyawan, integrasi potongan absensi, BPJS Kesehatan/Ketenagakerjaan, serta Pajak PPh 21 Progresif (UU HPP No. 7/2021).

---

## 📁 Struktur Folder Proyek

```text
Web-Gaji-Karyawan/
├── docs/                        # Dokumentasi Lengkap & Diagram Proyek
│   ├── DOKUMENTASI.md           # Panduan Teknis & Pengujian Aplikasi
│   ├── LATAR_BELAKANG_PPT_SERKOM.md # Bahan Presentasi & Latar Belakang Sertifikasi
│   ├── PERHITUNGAN_GAJI_DAN_PAJAK.md # Penjelasan Rumus PPh 21 & BPJS untuk Asesor
│   └── diagrams/                # File Diagram Draw.io
│       ├── ERD_Web_Gaji_Karyawan.drawio  # Entity Relationship Diagram
│       ├── LRS_Web_Gaji_Karyawan.drawio  # Logical Record Structure
│       └── ERD_LRS_Web_Gaji_Karyawan.drawio # Gabungan ERD & LRS
├── prisma/                      # Skema Database PostgreSQL & Migration
│   └── schema.prisma
├── public/                      # Asset Statis (Gambar, Favicon, dll)
├── src/                         # Source Code Aplikasi (Next.js App Router)
│   ├── app/                     # Routing, Pages, & API Routes
│   │   ├── api/                 # Endpoint REST API (Penggajian, Kehadiran, Auth)
│   │   ├── admin-dashboard/     # Portal Admin / HR
│   │   └── karyawan-dashboard/  # Portal Self-Service Karyawan
│   ├── components/              # Komponen UI Reusable
│   ├── lib/                     # Client Database (Prisma Instance)
│   └── utils/                   # Logika Bisnis (salaryCalculator.ts & Tests)
├── .env                         # Konfigurasi Environment Variables
├── package.json                 # Dependencies Proyek
└── tsconfig.json                # Konfigurasi TypeScript
```

---

## 📚 Dokumen Penting Proyek

- 📄 **[Latar Belakang & Presentasi PPT](file:///c:/Users/PC/Documents/Projekl/Web-Gaji-Karyawan/docs/LATAR_BELAKANG_PPT_SERKOM.md)**
- 📄 **[Dokumentasi Perhitungan Gaji & Pajak PPh 21](file:///c:/Users/PC/Documents/Projekl/Web-Gaji-Karyawan/docs/PERHITUNGAN_GAJI_DAN_PAJAK.md)**
- 📄 **[Dokumentasi Teknis Aplikasi](file:///c:/Users/PC/Documents/Projekl/Web-Gaji-Karyawan/docs/DOKUMENTASI.md)**
- 📐 **Diagram ERD & LRS**: Ditemukan pada folder [`docs/diagrams/`](file:///c:/Users/PC/Documents/Projekl/Web-Gaji-Karyawan/docs/diagrams)

---

## 🚀 Cara Menjalankan Aplikasi

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Jalankan Server Development**:
   ```bash
   npm run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000) pada browser Anda.

3. **Menjalankan Pengujian Otomatis (Unit Test)**:
   ```bash
   npx vitest run
   ```
