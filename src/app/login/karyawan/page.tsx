'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Lock, Mail, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function KaryawanLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        const { user } = data;
        if (user.role === 'KARYAWAN') {
          localStorage.setItem('employeeSession', JSON.stringify({
            id: user.id,
            email: user.email,
            nama: user.nama,
            role: 'KARYAWAN',
          }));
          router.push('/karyawan-dashboard');
        } else {
          setError('Akun ini bukan akun Karyawan. Silakan gunakan Portal Admin.');
          setLoading(false);
        }
      } else {
        setError(data.error || 'Email atau kata sandi salah.');
        setLoading(false);
      }
    } catch {
      setError('Gagal terhubung ke server. Periksa koneksi internet Anda.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 70% 15%, #052e16 0%, #030712 65%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '1.5rem',
    }}>
      {/* Back link */}
      <div style={{ width: '100%', maxWidth: '420px', marginBottom: '1.25rem' }}>
        <Link href="/login" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.84rem',
          transition: 'color 0.2s',
        }}>
          <ArrowLeft size={15} />
          Kembali ke Pilihan Portal
        </Link>
      </div>

      <div className="glass-card" style={{
        width: '100%', maxWidth: '420px', padding: '2.5rem',
        background: 'rgba(5,18,12,0.8)',
        border: '1px solid rgba(16,185,129,0.2)',
        boxShadow: '0 0 50px rgba(16,185,129,0.06)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', textAlign: 'center' }}>
          <div style={{
            width: '52px', height: '52px',
            background: 'rgba(16,185,129,0.12)',
            border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--success)',
          }}>
            <User size={26} />
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.4rem', marginBottom: 0 }}>
            Login Karyawan
          </h1>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
            Akses slip gaji, absensi, dan pengajuan izin Anda
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="badge badge-error" style={{
            display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
            width: '100%', padding: '0.75rem', marginBottom: '1.5rem',
            textTransform: 'none', whiteSpace: 'normal', textAlign: 'left', lineHeight: 1.4,
            borderRadius: '8px',
          }}>
            <AlertCircle size={17} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span style={{ fontSize: '0.84rem' }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label">Email Karyawan</label>
            <div style={{ position: 'relative' }}>
              <Mail size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                id="karyawan-email"
                type="email"
                placeholder="nama.karyawan@gajikita.com"
                className="form-input"
                style={{ paddingLeft: '40px' }}
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Kata Sandi</label>
            <div style={{ position: 'relative' }}>
              <Lock size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                id="karyawan-password"
                type={showPass ? 'text' : 'password'}
                placeholder="Masukkan kata sandi"
                className="form-input"
                style={{ paddingLeft: '40px', paddingRight: '42px' }}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                style={{
                  position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-secondary)', padding: '4px',
                }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            id="karyawan-login-submit"
            type="submit"
            className="btn"
            style={{
              width: '100%', padding: '0.8rem', fontSize: '0.95rem', marginTop: '0.25rem',
              background: 'linear-gradient(135deg, #059669, #10b981)',
              color: '#fff', border: 'none', borderRadius: '8px',
              fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1, transition: 'opacity 0.2s',
            }}
            disabled={loading}
          >
            {loading ? 'Memverifikasi...' : 'Masuk sebagai Karyawan'}
          </button>
        </form>

        <div style={{
          marginTop: '1.5rem', padding: '0.75rem',
          background: 'rgba(16,185,129,0.04)',
          border: '1px dashed rgba(16,185,129,0.15)',
          borderRadius: '8px', fontSize: '0.75rem',
          color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6,
        }}>
          👤 Gunakan email dan kata sandi yang diberikan oleh Admin
        </div>
      </div>
    </div>
  );
}
