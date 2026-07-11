/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is not set. Skipping seed.');
    return;
  }

  console.log('Connecting to database for seeding...');
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter }) as any;

  console.log('Clearing existing Indonesian tables data...');
  await prisma.penggajian.deleteMany({});
  await prisma.kehadiran.deleteMany({});
  await prisma.karyawan.deleteMany({});
  await prisma.admin.deleteMany({});

  console.log('Seeding Admin...');
  await prisma.admin.create({
    data: {
      nama: 'Administrator',
      email: 'admin@gajikita.com',
      password: 'passwordadmin',
    },
  });

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // 1-12
  const currentYear = currentDate.getFullYear();

  console.log('Seeding Karyawan...');
  const emp1 = await prisma.karyawan.create({
    data: {
      nama: 'Rian Wijaya',
      email: 'rian.wijaya@gajikita.com',
      jabatan: 'Manager',
      statusKerja: 'TETAP',
      gajiPokok: 15000000,
      tunjanganJabatan: 3000000,
      namaBank: 'BCA',
      nomorRekening: '5241088921',
    },
  });

  const emp2 = await prisma.karyawan.create({
    data: {
      nama: 'Siti Rahmawati',
      email: 'siti.rahma@gajikita.com',
      jabatan: 'Senior Developer',
      statusKerja: 'TETAP',
      gajiPokok: 12000000,
      tunjanganJabatan: 2000000,
      namaBank: 'Mandiri',
      nomorRekening: '132009876543',
    },
  });

  const emp3 = await prisma.karyawan.create({
    data: {
      nama: 'Budi Santoso',
      email: 'budi.santoso@gajikita.com',
      jabatan: 'Software Engineer',
      statusKerja: 'KONTRAK',
      gajiPokok: 8500000,
      tunjanganJabatan: 1000000,
      namaBank: 'BNI',
      nomorRekening: '0987654321',
    },
  });

  const emp4 = await prisma.karyawan.create({
    data: {
      nama: 'Dewi Lestari',
      email: 'dewi.lestari@gajikita.com',
      jabatan: 'QA Engineer',
      statusKerja: 'KONTRAK',
      gajiPokok: 7000000,
      tunjanganJabatan: 500000,
      namaBank: 'BRI',
      nomorRekening: '0012019876543',
    },
  });

  await prisma.karyawan.create({
    data: {
      nama: 'Andi Pratama',
      email: 'andi.pratama@gajikita.com',
      jabatan: 'Staff Admin',
      statusKerja: 'TETAP',
      gajiPokok: 5500000,
      tunjanganJabatan: 0,
      namaBank: 'BCA',
      nomorRekening: '5241099234',
    },
  });

  console.log('Seeding Kehadiran for current month...');
  await prisma.kehadiran.createMany({
    data: [
      {
        karyawanId: emp1.id,
        bulan: currentMonth,
        tahun: currentYear,
        hariHadir: 22,
        hariSakit: 0,
        hariCuti: 0,
        hariAlpha: 0,
      },
      {
        karyawanId: emp2.id,
        bulan: currentMonth,
        tahun: currentYear,
        hariHadir: 21,
        hariSakit: 1,
        hariCuti: 0,
        hariAlpha: 0,
      },
      {
        karyawanId: emp3.id,
        bulan: currentMonth,
        tahun: currentYear,
        hariHadir: 20,
        hariSakit: 0,
        hariCuti: 2,
        hariAlpha: 0,
      },
      {
        karyawanId: emp4.id,
        bulan: currentMonth,
        tahun: currentYear,
        hariHadir: 18,
        hariSakit: 2,
        hariCuti: 0,
        hariAlpha: 2, // 2 alpha days
      },
    ],
  });

  console.log('Indonesian tables seeding finished successfully.');
  await pool.end();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
