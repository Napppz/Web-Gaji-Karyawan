'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function AdminLoginPage() {
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
        if (user.role === 'ADMIN') {
          localStorage.setItem('adminActive', 'active');
          localStorage.setItem('adminSession', JSON.stringify({
            email: user.email,
            role: 'ADMIN',
            nama: user.nama,
          }));
          router.push('/dashboard');
        } else {
          setError('Akun ini bukan akun Admin. Silakan gunakan Portal Karyawan.');
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
      background: 'radial-gradient(circle at 25% 15%, #1e1b4b 0%, #030712 70%)',
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
        background: 'rgba(10,14,24,0.8)',
        border: '1px solid rgba(99,102,241,0.2)',
        boxShadow: '0 0 50px rgba(99,102,241,0.08)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', textAlign: 'center' }}>
          <div style={{
            width: '52px', height: '52px',
            background: 'rgba(99,102,241,0.15)',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--primary)',
          }}>
            <ShieldCheck size={26} />
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.4rem', marginBottom: 0 }}>
            Login Admin
          </h1>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
            Akses dashboard pengelolaan sistem penggajian
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
            <label className="form-label">Email Admin</label>
            <div style={{ position: 'relative' }}>
              <Mail size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                id="admin-email"
                type="email"
                placeholder="admin@gajikita.com"
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
                id="admin-password"
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
            id="admin-login-submit"
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.8rem', fontSize: '0.95rem', marginTop: '0.25rem' }}
            disabled={loading}
          >
            {loading ? 'Memverifikasi...' : 'Masuk sebagai Admin'}
          </button>
        </form>

        <div style={{
          marginTop: '1.5rem', padding: '0.75rem',
          background: 'rgba(99,102,241,0.04)',
          border: '1px dashed rgba(99,102,241,0.15)',
          borderRadius: '8px', fontSize: '0.75rem',
          color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6,
        }}>
          🔐 Hanya akun Admin yang dapat menggunakan portal ini
        </div>
      </div>
    </div>
  );
}
