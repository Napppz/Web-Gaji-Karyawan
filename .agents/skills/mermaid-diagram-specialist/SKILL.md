---
name: mermaid-diagram-specialist
description: Expert dalam membuat diagram Mermaid komprehensif termasuk ERD, LRS, flowchart, sequence diagram, dan architecture visualization untuk proyek Web-Gaji-Karyawan
---

# Mermaid Diagram Specialist

## Overview

**Purpose**: Expert dalam membuat diagram Mermaid yang komprehensif untuk dokumentasi, visualisasi arsitektur, dan pemodelan data — khususnya untuk proyek **Web-Gaji-Karyawan** berbasis Next.js + Prisma + PostgreSQL.

**Category**: Tech  
**Primary Users**: tech-writer, architecture-validator, product-technical, tech-lead

---

## When to Use This Skill

- Membuat ERD (Entity Relationship Diagram) dari Prisma schema
- Membuat LRS (Logical Record Structure) dari database model
- Visualisasi workflow proses penggajian
- Dokumentasi arsitektur sistem
- Membuat sequence diagram untuk API flows
- Visualisasi data model dan relasi antar entitas

---

## Prerequisites

**Required:**
- Akses ke file `prisma/schema.prisma` untuk ERD/LRS
- Pemahaman tentang tipe diagram yang dibutuhkan

**Optional:**
- Warna design system untuk konsistensi
- Dokumentasi yang sudah ada sebagai referensi

---

## Available Diagram Types

1. **Flowchart** - Decision flows, algorithms, processes
2. **Sequence Diagram** - API interactions, message flows
3. **ERD** - Database schemas, entity relationships (Primary for this project)
4. **Class Diagram** - Object-oriented design
5. **State Diagram** - State machines, lifecycle

**Decision Matrix:**
- Database structure -> ERD
- Logical Record Structure -> ERD with crow's foot notation
- Process with decisions -> Flowchart
- API/system interactions -> Sequence Diagram

---

## Workflow

### Step 1: Diagram Type Selection

Pilih tipe diagram yang sesuai. Untuk ERD/LRS gunakan `erDiagram` syntax Mermaid.

### Step 2: Entity Analysis (untuk ERD/LRS)

Baca dan analisis `prisma/schema.prisma` untuk mengekstrak:
- Semua model/entitas
- Field dan tipe data setiap entitas
- Relasi antar entitas (one-to-one, one-to-many, many-to-many)
- Primary keys, foreign keys, dan unique constraints

### Step 3: Relationship Mapping

Notasi Crow's Foot Mermaid:
- ||--||  = one-to-one
- ||--o|  = one-to-one or zero
- ||--o{  = one-to-many (one to zero or more)
- ||--|{  = one-to-many (one to one or more)
- }o--o{  = many-to-many

### Step 4: Diagram Generation

Generate diagram dengan format yang bersih dan valid.

### Step 5: Validation Checklist

- Semua entitas dari schema tercakup
- Tipe data akurat
- Relasi benar (arah dan kardinalitas)
- Label relasi deskriptif
- Syntax Mermaid valid
- PK dan FK ditandai dengan jelas

---

## Project-Specific Context: Web-Gaji-Karyawan

### Entities (dari Prisma Schema)

| Model | Deskripsi |
|-------|-----------|
| Karyawan | Data master karyawan dengan info gaji dan rekening |
| Kehadiran | Rekap kehadiran bulanan (hadir, sakit, cuti, alpha, lembur) |
| Penggajian | Slip gaji bulanan dengan tunjangan, potongan, pajak |
| PengajuanIzin | Pengajuan izin/cuti karyawan |
| Pengaturan | Konfigurasi sistem (key-value store) |
| Admin | Data admin sistem |

### Key Relationships

- Karyawan -> Kehadiran: one-to-many
- Karyawan -> Penggajian: one-to-many
- Karyawan -> PengajuanIzin: one-to-many
- Pengaturan dan Admin: standalone entities

---

## Mermaid Syntax Rules (Critical)

1. Hindari karakter spesial dalam label: (, ), {, }, [, ]
2. Gunakan tanda kutip untuk label yang mengandung spasi
3. Tipe data ERD yang valid: string, int, float, boolean, datetime, uuid
4. Nama entitas harus UPPERCASE atau PascalCase untuk ERD
5. Jangan gunakan reserved keywords sebagai nama field

---

## Output Format

Selalu hasilkan:
1. Diagram Mermaid dalam fenced code block dengan bahasa mermaid
2. Penjelasan singkat setiap relasi
3. Catatan tentang constraint penting (unique, cascade delete, dll)
