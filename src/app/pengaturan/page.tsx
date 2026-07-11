'use client';

import { useState, useEffect } from 'react';
import { Save, Clock, HelpCircle } from 'lucide-react';

export default function PengaturanPage() {
  const [jamMasuk, setJamMasuk] = useState('09:00');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pengaturan');
      if (res.ok) {
        const data = await res.json();
        if (data.JAM_MASUK) {
          setJamMasuk(data.JAM_MASUK);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/pengaturan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ JAM_MASUK: jamMasuk }),
      });
      const result = await res.json();
      if (res.ok) {
        setToastMessage('✅ Pengaturan berhasil diperbarui!');
        setTimeout(() => setToastMessage(''), 3000);
      } else {
        alert(result.error || 'Gagal menyimpan pengaturan.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h1>Pengaturan Sistem</h1>
          <p>Konfigurasi parameter operasional portal kepegawaian dan absensi.</p>
        </div>
      </div>

      <div style={{ maxWidth: '600px', marginTop: '1.5rem' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: '1rem', color: 'var(--text-secondary)' }}>
            <div style={{ width: '30px', height: '30px', border: '3px solid var(--border-light)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            Memuat data pengaturan...
          </div>
        ) : (
          <form onSubmit={handleSave} className="glass-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ width: '32px', height: '32px', background: 'rgba(99,102,241,0.12)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <Clock size={16} />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Konfigurasi Waktu Kerja</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Atur jam toleransi keterlambatan masuk</p>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" htmlFor="jamMasuk" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>Jam Masuk Batas (Toleransi Terlambat)</span>
                <span title="Absensi setelah jam ini akan otomatis dicatat sebagai TERLAMBAT di dashboard karyawan" style={{ cursor: 'help', color: 'var(--text-muted)' }}>
                  <HelpCircle size={14} />
                </span>
              </label>
              <input
                id="jamMasuk"
                type="time"
                value={jamMasuk}
                onChange={(e) => setJamMasuk(e.target.value)}
                className="form-input"
                required
                style={{ width: '100%', maxWidth: '200px', fontSize: '1.1rem', letterSpacing: '1px', fontFamily: 'monospace' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 2rem', fontWeight: 700 }}
              >
                <Save size={16} />
                <span>{saving ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* TOAST SUCCESS */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          backgroundColor: '#0f172a',
          border: '1px solid var(--success)',
          boxShadow: '0 0 20px var(--success-glow)',
          color: '#fff',
          padding: '1rem 1.5rem',
          borderRadius: '10px',
          zIndex: 9999,
          animation: 'slideIn 0.3s ease-out',
          fontSize: '0.9rem',
          fontWeight: 600,
        }}>
          {toastMessage}
        </div>
      )}
    </>
  );
}
