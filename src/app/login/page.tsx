'use client';

import Link from 'next/link';
import { Layers, ShieldCheck, User, ArrowRight } from 'lucide-react';

export default function LoginSelectPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 30% 20%, #1e1b4b 0%, #030712 60%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem',
      gap: '2.5rem',
    }}>
      {/* Brand */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.6rem',
          marginBottom: '0.75rem',
        }}>
          <div style={{
            width: '44px', height: '44px',
            background: 'rgba(99,102,241,0.15)',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--primary)',
          }}>
            <Layers size={24} />
          </div>
          <span style={{
            fontSize: '1.5rem', fontWeight: 800,
            background: 'linear-gradient(to right, #fff, var(--primary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>GajiKita</span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.4rem' }}>
          Pilih Portal Login
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
          Silakan pilih portal sesuai peran Anda
        </p>
      </div>

      {/* Card Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        width: '100%',
        maxWidth: '640px',
      }}>
        {/* Admin Card */}
        <Link href="/login/admin" style={{ textDecoration: 'none' }}>
          <div className="glass-card" style={{
            padding: '2.25rem',
            cursor: 'pointer',
            border: '1px solid rgba(99,102,241,0.2)',
            transition: 'all 0.25s ease',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            background: 'rgba(99,102,241,0.04)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(99,102,241,0.5)';
            (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
            (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 40px rgba(99,102,241,0.15)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(99,102,241,0.2)';
            (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
            (e.currentTarget as HTMLDivElement).style.boxShadow = '';
          }}>
            <div style={{
              width: '52px', height: '52px',
              background: 'rgba(99,102,241,0.15)',
              border: '1px solid rgba(99,102,241,0.25)',
              borderRadius: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--primary)',
            }}>
              <ShieldCheck size={26} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.4rem', color: '#fff' }}>
                Portal Admin
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                Akses penuh untuk mengelola karyawan, penggajian, absensi, dan laporan
              </p>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600,
            }}>
              Masuk sebagai Admin <ArrowRight size={15} />
            </div>
          </div>
        </Link>

        {/* Karyawan Card */}
        <Link href="/login/karyawan" style={{ textDecoration: 'none' }}>
          <div className="glass-card" style={{
            padding: '2.25rem',
            cursor: 'pointer',
            border: '1px solid rgba(16,185,129,0.2)',
            transition: 'all 0.25s ease',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            background: 'rgba(16,185,129,0.03)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(16,185,129,0.5)';
            (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
            (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 40px rgba(16,185,129,0.12)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(16,185,129,0.2)';
            (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
            (e.currentTarget as HTMLDivElement).style.boxShadow = '';
          }}>
            <div style={{
              width: '52px', height: '52px',
              background: 'rgba(16,185,129,0.12)',
              border: '1px solid rgba(16,185,129,0.25)',
              borderRadius: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--success)',
            }}>
              <User size={26} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.4rem', color: '#fff' }}>
                Portal Karyawan
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                Lihat slip gaji, rekap absensi, dan ajukan izin sakit atau cuti
              </p>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              color: 'var(--success)', fontSize: '0.85rem', fontWeight: 600,
            }}>
              Masuk sebagai Karyawan <ArrowRight size={15} />
            </div>
          </div>
        </Link>
      </div>

      <Link href="/" style={{
        color: 'var(--text-muted)', fontSize: '0.82rem', textDecoration: 'none',
        display: 'flex', alignItems: 'center', gap: '0.35rem',
        transition: 'color 0.2s',
      }}
      onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)'}
      onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)'}
      >
        ← Kembali ke Halaman Utama
      </Link>
    </div>
  );
}
