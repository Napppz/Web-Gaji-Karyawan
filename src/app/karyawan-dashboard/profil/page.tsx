/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect } from 'react';
import {
  User, ShieldCheck, Mail, Briefcase, DollarSign, CreditCard,
  ChevronRight, Lock, Eye, EyeOff, CheckCircle2, AlertCircle,
  Calendar, Building2,
} from 'lucide-react';

export default function KaryawanProfilPage() {
  const [userSession, setUserSession] = useState<any>(null);
  const [employeeData, setEmployeeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  const fetchEmployeeData = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/karyawan/${id}`);
      if (res.ok) {
        const data = await res.json();
        setEmployeeData(data);
      } else {
        setError('Gagal memuat profil karyawan.');
      }
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const sessionStr = localStorage.getItem('employeeSession');
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      setUserSession(session);
      fetchEmployeeData(session.id);
    } else {
      setError('Sesi Anda tidak valid. Silakan login kembali.');
      setLoading(false);
    }
  }, []);

  const formatIDR = (num: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);

  const getInitials = (nameStr: string) => {
    if (!nameStr) return 'K';
    return nameStr.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  const getPasswordStrength = (pw: string): { level: 'weak' | 'medium' | 'strong'; label: string; color: string } => {
    if (pw.length < 6) return { level: 'weak', label: 'Terlalu pendek', color: 'var(--error)' };
    const hasUpper = /[A-Z]/.test(pw);
    const hasNumber = /[0-9]/.test(pw);
    const hasSpecial = /[^A-Za-z0-9]/.test(pw);
    const score = [pw.length >= 8, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
    if (score <= 1) return { level: 'weak', label: 'Lemah', color: 'var(--error)' };
    if (score <= 3) return { level: 'medium', label: 'Cukup', color: '#f59e0b' };
    return { level: 'strong', label: 'Kuat', color: 'var(--success)' };
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwError('Semua kolom wajib diisi.');
      return;
    }
    if (newPassword.length < 6) {
      setPwError('Password baru minimal 6 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('Konfirmasi password tidak cocok dengan password baru.');
      return;
    }
    if (currentPassword !== employeeData.password) {
      setPwError('Password saat ini salah. Silakan periksa kembali.');
      return;
    }
    if (newPassword === currentPassword) {
      setPwError('Password baru tidak boleh sama dengan password saat ini.');
      return;
    }

    setPwLoading(true);
    try {
      const res = await fetch(`/api/karyawan/${userSession.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });
      if (res.ok) {
        setEmployeeData((prev: any) => ({ ...prev, password: newPassword }));
        setPwSuccess('Password berhasil diperbarui!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const data = await res.json();
        setPwError(data.error || 'Gagal memperbarui password.');
      }
    } catch (err) {
      console.error(err);
      setPwError('Terjadi kesalahan jaringan. Coba lagi.');
    } finally {
      setPwLoading(false);
    }
  };

  const pwStrength = newPassword ? getPasswordStrength(newPassword) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── PAGE BANNER ─────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(16,185,129,0.08) 60%, transparent 100%)',
        border: '1px solid rgba(99,102,241,0.18)',
        borderRadius: '16px',
        padding: '1.5rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 0.25rem', color: 'var(--text-primary)' }}>Profil Saya</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
            Detail informasi kepegawaian dan pengaturan keamanan akun Anda
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Portal Kepegawaian</span>
          <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>Profil Saya</span>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem', gap: '1rem', color: 'var(--text-secondary)' }}>
          <div style={{ width: '36px', height: '36px', border: '3px solid var(--border-light)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          Memuat data profil...
        </div>
      ) : error ? (
        <div className="badge badge-error" style={{ padding: '1rem', width: '100%', fontSize: '1rem' }}>
          {error}
        </div>
      ) : (
        <>
          {/* ── HERO PROFILE CARD ─────────────────────────────────── */}
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Gradient Banner Strip */}
            <div style={{
              height: '100px',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.35) 0%, rgba(129,140,248,0.2) 50%, rgba(16,185,129,0.15) 100%)',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(99,102,241,0.3) 0%, transparent 60%), radial-gradient(circle at 80% 50%, rgba(16,185,129,0.2) 0%, transparent 60%)',
              }} />
            </div>

            {/* Avatar + Name Row */}
            <div style={{ padding: '0 2rem 2rem', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.5rem', flexWrap: 'wrap', marginTop: '-3rem', marginBottom: '1.5rem' }}>
                {/* Avatar */}
                <div style={{
                  width: '88px', height: '88px',
                  background: 'linear-gradient(135deg, var(--primary), #818cf8)',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2rem', fontWeight: 800, color: '#fff',
                  boxShadow: '0 8px 30px rgba(99,102,241,0.4)',
                  border: '4px solid #0f1626',
                  flexShrink: 0,
                }}>
                  {getInitials(employeeData.nama)}
                </div>

                {/* Name & title */}
                <div style={{ paddingBottom: '0.35rem' }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 0.2rem', color: 'var(--text-primary)' }}>
                    {employeeData.nama}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{employeeData.jabatan}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>·</span>
                    <span style={{
                      background: employeeData.statusKerja === 'TETAP' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                      color: employeeData.statusKerja === 'TETAP' ? 'var(--success)' : '#f59e0b',
                      border: employeeData.statusKerja === 'TETAP' ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(245,158,11,0.2)',
                      fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.6rem', borderRadius: '20px'
                    }}>{employeeData.statusKerja}</span>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                      background: 'rgba(16,185,129,0.08)', color: 'var(--success)',
                      border: '1px solid rgba(16,185,129,0.15)',
                      fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.65rem', borderRadius: '20px'
                    }}>
                      <ShieldCheck size={11} /> AKUN AKTIF
                    </span>
                  </div>
                </div>
              </div>

              {/* Info grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
                {[
                  { icon: ShieldCheck, label: 'NIK Karyawan', value: employeeData.id.substring(0, 8).toUpperCase(), color: 'var(--primary)' },
                  { icon: Mail, label: 'Email Resmi', value: employeeData.email, color: '#0ea5e9' },
                  { icon: Briefcase, label: 'Jabatan', value: employeeData.jabatan, color: '#f59e0b' },
                  { icon: Building2, label: 'Perusahaan', value: 'PT Nappz Teknologi Nusantara', color: 'var(--success)' },
                  { icon: DollarSign, label: 'Gaji Pokok', value: formatIDR(employeeData.gajiPokok), color: 'var(--success)' },
                  { icon: CreditCard, label: 'Rekening', value: `${employeeData.namaBank} · ${employeeData.nomorRekening}`, color: '#a78bfa' },
                  { icon: Calendar, label: 'Bergabung Sejak', value: formatDate(employeeData.dibuatPada), color: 'var(--text-muted)' },
                  { icon: User, label: 'ID Akun', value: `#${employeeData.id.substring(0, 12).toUpperCase()}`, color: 'var(--text-muted)' },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} style={{
                    padding: '1rem 1.25rem',
                    background: 'rgba(255,255,255,0.01)',
                    display: 'flex', alignItems: 'center', gap: '0.85rem',
                    transition: 'background 0.2s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.035)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.01)')}
                  >
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '9px',
                      background: 'rgba(255,255,255,0.04)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color, flexShrink: 0,
                    }}>
                      <Icon size={16} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.2rem', fontWeight: 500 }}>{label}</div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── GANTI PASSWORD CARD ───────────────────────────────── */}
          <div className="glass-card" style={{ padding: '2rem' }}>

            {/* Card Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '2rem', paddingBottom: '1.25rem',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              flexWrap: 'wrap', gap: '1rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '40px', height: '40px',
                  background: 'linear-gradient(135deg, rgba(244,63,94,0.2), rgba(244,63,94,0.06))',
                  borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--error)',
                  border: '1px solid rgba(244,63,94,0.18)',
                }}>
                  <Lock size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Keamanan Akun</h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>Perbarui kata sandi secara berkala untuk menjaga keamanan akun</p>
                </div>
              </div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                background: 'rgba(99,102,241,0.08)', color: 'var(--primary)',
                border: '1px solid rgba(99,102,241,0.18)',
                padding: '0.35rem 0.9rem', borderRadius: '30px',
                fontSize: '0.72rem', fontWeight: 600,
              }}>
                <ShieldCheck size={13} />
                <span>Enkripsi Aman</span>
              </div>
            </div>

            <form onSubmit={handleChangePassword}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>

                {/* Password Saat Ini */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    <Lock size={12} /> Password Saat Ini
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="current-password"
                      type={showCurrent ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={e => { setCurrentPassword(e.target.value); setPwError(''); setPwSuccess(''); }}
                      placeholder="Password lama Anda"
                      className="form-input"
                      style={{ paddingRight: '2.8rem', width: '100%' }}
                      required
                    />
                    <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                      style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, display: 'flex' }}>
                      {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Password Baru */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    <Lock size={12} /> Password Baru
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="new-password"
                      type={showNew ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => { setNewPassword(e.target.value); setPwError(''); setPwSuccess(''); }}
                      placeholder="Min. 6 karakter"
                      className="form-input"
                      style={{ paddingRight: '2.8rem', width: '100%' }}
                      required
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)}
                      style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, display: 'flex' }}>
                      {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {pwStrength && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <div style={{ display: 'flex', gap: '3px', marginBottom: '0.25rem' }}>
                        {(['weak', 'medium', 'strong'] as const).map((_, i) => (
                          <div key={i} style={{
                            flex: 1, height: '3px', borderRadius: '2px',
                            background: (['weak', 'medium', 'strong'].indexOf(pwStrength.level) >= i) ? pwStrength.color : 'rgba(255,255,255,0.07)',
                            transition: 'all 0.3s ease',
                          }} />
                        ))}
                      </div>
                      <span style={{ fontSize: '0.7rem', color: pwStrength.color, fontWeight: 600 }}>{pwStrength.label}</span>
                    </div>
                  )}
                </div>

                {/* Konfirmasi Password */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    <Lock size={12} /> Konfirmasi Password Baru
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="confirm-password"
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => { setConfirmPassword(e.target.value); setPwError(''); setPwSuccess(''); }}
                      placeholder="Ulangi password baru"
                      className="form-input"
                      style={{
                        paddingRight: '2.8rem', width: '100%',
                        borderColor: confirmPassword && newPassword !== confirmPassword
                          ? 'rgba(244,63,94,0.5)'
                          : confirmPassword && newPassword === confirmPassword
                            ? 'rgba(16,185,129,0.5)' : '',
                      }}
                      required
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, display: 'flex' }}>
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {confirmPassword && (
                    <div style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', fontWeight: 600, color: newPassword === confirmPassword ? 'var(--success)' : 'var(--error)' }}>
                      {newPassword === confirmPassword ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                      {newPassword === confirmPassword ? 'Password cocok' : 'Password tidak cocok'}
                    </div>
                  )}
                </div>
              </div>

              {/* Tips row */}
              <div style={{
                display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center',
                background: 'rgba(99,102,241,0.04)',
                border: '1px solid rgba(99,102,241,0.1)',
                borderRadius: '10px', padding: '0.75rem 1.25rem',
                marginBottom: '1.25rem',
              }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>💡 Tips:</span>
                {['Min. 8 karakter', 'Huruf besar & kecil', 'Tambahkan angka', 'Gunakan simbol (!@#$)'].map(tip => (
                  <span key={tip} style={{
                    fontSize: '0.7rem', color: 'var(--text-secondary)',
                    background: 'rgba(255,255,255,0.04)', padding: '0.18rem 0.6rem',
                    borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    {tip}
                  </span>
                ))}
              </div>

              {/* Alert */}
              {(pwError || pwSuccess) && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.6rem',
                  padding: '0.85rem 1.25rem', marginBottom: '1.25rem',
                  borderRadius: '10px',
                  background: pwError ? 'rgba(244,63,94,0.07)' : 'rgba(16,185,129,0.07)',
                  border: `1px solid ${pwError ? 'rgba(244,63,94,0.2)' : 'rgba(16,185,129,0.2)'}`,
                  color: pwError ? 'var(--error)' : 'var(--success)',
                  fontSize: '0.88rem', fontWeight: 600,
                }}>
                  {pwError ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                  {pwError || pwSuccess}
                </div>
              )}

              {/* Submit */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={pwLoading}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.72rem 2rem', fontWeight: 700 }}
                >
                  {pwLoading ? (
                    <>
                      <div style={{ width: '15px', height: '15px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Lock size={15} />
                      Simpan Password Baru
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
      <style>{`@keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }`}</style>
    </div>
  );
}
