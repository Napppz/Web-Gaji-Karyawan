/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from 'react';
import { Layers, CalendarDays, Bell, CheckCircle2 } from 'lucide-react';

const BULAN_LIST = [
  { value: 1, label: 'Januari' },
  { value: 2, label: 'Februari' },
  { value: 3, label: 'Maret' },
  { value: 4, label: 'April' },
  { value: 5, label: 'Mei' },
  { value: 6, label: 'Juni' },
  { value: 7, label: 'Juli' },
  { value: 8, label: 'Agustus' },
  { value: 9, label: 'September' },
  { value: 10, label: 'Oktober' },
  { value: 11, label: 'November' },
  { value: 12, label: 'Desember' },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 11) return 'Selamat Pagi';
  if (h < 15) return 'Selamat Siang';
  if (h < 18) return 'Selamat Sore';
  return 'Selamat Malam';
}

function getGreetingEmoji() {
  const h = new Date().getHours();
  if (h < 11) return '🌤️';
  if (h < 15) return '☀️';
  if (h < 18) return '🌇';
  return '🌙';
}

export default function KaryawanIzinPage() {
  const [userSession, setUserSession] = useState<any>(null);
  const [employeeData, setEmployeeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [time, setTime] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Leave Form & History State
  const [leaveHistory, setLeaveHistory] = useState<any[]>([]);

  const todayD = new Date();
  const [leaveForm, setLeaveForm] = useState({
    jenis: 'SAKIT',
    mulaiHari: todayD.getDate(),
    mulaiBulan: todayD.getMonth() + 1,
    mulaiTahun: todayD.getFullYear(),
    selesaiHari: todayD.getDate(),
    selesaiBulan: todayD.getMonth() + 1,
    selesaiTahun: todayD.getFullYear(),
    keterangan: '',
  });
  const [submittingLeave, setSubmittingLeave] = useState(false);

  const daysInMonth = (bulan: number, tahun: number) => new Date(tahun, bulan, 0).getDate();

  const computeTotalHari = () => {
    const start = new Date(leaveForm.mulaiTahun, leaveForm.mulaiBulan - 1, leaveForm.mulaiHari);
    const end   = new Date(leaveForm.selesaiTahun, leaveForm.selesaiBulan - 1, leaveForm.selesaiHari);
    const diff  = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 0;
  };

  const fetchLeaveHistory = async (karyawanId: string) => {
    try {
      const res = await fetch(`/api/pengajuan-izin?karyawanId=${karyawanId}`);
      if (res.ok) {
        const data = await res.json();
        setLeaveHistory(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEmployeeData = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/karyawan/${id}`);
      if (res.ok) {
        const data = await res.json();
        setEmployeeData(data);
        await fetchLeaveHistory(id);
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
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(
        new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeData) return;
    const pad = (n: number) => String(n).padStart(2, '0');
    const tanggalMulai   = `${leaveForm.mulaiTahun}-${pad(leaveForm.mulaiBulan)}-${pad(leaveForm.mulaiHari)}`;
    const tanggalSelesai = `${leaveForm.selesaiTahun}-${pad(leaveForm.selesaiBulan)}-${pad(leaveForm.selesaiHari)}`;
    if (new Date(tanggalMulai) > new Date(tanggalSelesai)) {
      alert('Tanggal mulai tidak boleh melebihi tanggal selesai.');
      return;
    }
    setSubmittingLeave(true);
    try {
      const res = await fetch('/api/pengajuan-izin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          karyawanId: employeeData.id,
          jenis: leaveForm.jenis,
          tanggalMulai,
          tanggalSelesai,
          keterangan: leaveForm.keterangan,
        }),
      });
      if (res.ok) {
        const now = new Date();
        setLeaveForm({
          jenis: 'SAKIT',
          mulaiHari: now.getDate(),
          mulaiBulan: now.getMonth() + 1,
          mulaiTahun: now.getFullYear(),
          selesaiHari: now.getDate(),
          selesaiBulan: now.getMonth() + 1,
          selesaiTahun: now.getFullYear(),
          keterangan: '',
        });
        setToastMessage('📋 Laporan izin berhasil dikirim ke Admin!');
        setTimeout(() => setToastMessage(''), 3500);
        fetchLeaveHistory(employeeData.id);
      } else {
        const r = await res.json();
        alert(r.error || 'Gagal mengirim pengajuan.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setSubmittingLeave(false);
    }
  };

  const firstName = (employeeData?.nama || userSession?.nama || '').split(' ')[0];

  return (
    <>
      {/* ── WELCOME HERO BANNER ───────────────────────────────────────── */}
      {!loading && !error && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(16,185,129,0.08) 60%, transparent 100%)',
          border: '1px solid rgba(99,102,241,0.18)',
          borderRadius: '16px',
          padding: '1.75rem 2rem',
          marginBottom: '1.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{
              width: '56px',
              height: '56px',
              background: 'linear-gradient(135deg, var(--primary), #818cf8)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              fontWeight: 800,
              color: '#fff',
              flexShrink: 0,
              boxShadow: '0 0 0 3px rgba(99,102,241,0.25)',
            }}>
              {firstName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 0.2rem' }}>
                {getGreetingEmoji()} {getGreeting()},
              </p>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 0.15rem', color: '#fff' }}>
                {employeeData?.nama || userSession?.nama}
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Pengajuan Sakit &amp; Cuti Karyawan
              </p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'monospace', fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '2px' }}>
              {time || '00:00:00'}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem', gap: '1rem', color: 'var(--text-secondary)' }}>
          <div style={{ width: '36px', height: '36px', border: '3px solid var(--border-light)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          Memuat data...
        </div>
      ) : error ? (
        <div className="badge badge-error" style={{ padding: '1rem', width: '100%', fontSize: '1rem' }}>
          {error}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {/* Form Ajukan Izin */}
          <div className="glass-card" style={{ padding: '1.75rem', border: '1px solid rgba(99,102,241,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ width: '32px', height: '32px', background: 'rgba(99,102,241,0.12)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <Bell size={16} />
              </div>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Ajukan Sakit &amp; Cuti</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Kirim permohonan izin ke Admin untuk diproses</p>
              </div>
            </div>
            <form onSubmit={handleLeaveSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {/* Jenis */}
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Jenis Izin</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                  {(['SAKIT', 'CUTI'] as const).map(jenis => (
                    <button key={jenis} type="button" onClick={() => setLeaveForm(prev => ({ ...prev, jenis }))} style={{
                      padding: '0.65rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s',
                      border: leaveForm.jenis === jenis ? `2px solid ${jenis === 'SAKIT' ? '#f59e0b' : 'var(--primary)'}` : '2px solid rgba(255,255,255,0.07)',
                      background: leaveForm.jenis === jenis ? (jenis === 'SAKIT' ? 'rgba(245,158,11,0.1)' : 'rgba(99,102,241,0.1)') : 'rgba(255,255,255,0.02)',
                      color: leaveForm.jenis === jenis ? (jenis === 'SAKIT' ? '#f59e0b' : 'var(--primary)') : 'var(--text-secondary)',
                    }}>
                      {jenis === 'SAKIT' ? '🤒 Sakit' : '🏖️ Cuti'}
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.35rem', marginBottom: 0 }}>
                  {leaveForm.jenis === 'SAKIT' ? 'Izin sakit akan masuk ke rekap hari sakit bulanan.' : 'Cuti akan mengurangi hari kerja efektif bulan ini.'}
                </p>
              </div>
              {/* Tanggal Mulai */}
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem' }}>📅 Tanggal Mulai</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1.4fr', gap: '0.5rem' }}>
                  <select className="form-input" style={{ fontSize: '0.82rem' }} value={leaveForm.mulaiHari} onChange={e => setLeaveForm(prev => ({ ...prev, mulaiHari: +e.target.value }))}>
                    {Array.from({ length: daysInMonth(leaveForm.mulaiBulan, leaveForm.mulaiTahun) }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <select className="form-input" style={{ fontSize: '0.82rem' }} value={leaveForm.mulaiBulan} onChange={e => { const b = +e.target.value; setLeaveForm(prev => ({ ...prev, mulaiBulan: b, mulaiHari: Math.min(prev.mulaiHari, daysInMonth(b, prev.mulaiTahun)) })); }}>
                    {BULAN_LIST.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                  <select className="form-input" style={{ fontSize: '0.82rem' }} value={leaveForm.mulaiTahun} onChange={e => setLeaveForm(prev => ({ ...prev, mulaiTahun: +e.target.value }))}>
                    {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              {/* Tanggal Selesai */}
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem' }}>📅 Tanggal Selesai</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1.4fr', gap: '0.5rem' }}>
                  <select className="form-input" style={{ fontSize: '0.82rem' }} value={leaveForm.selesaiHari} onChange={e => setLeaveForm(prev => ({ ...prev, selesaiHari: +e.target.value }))}>
                    {Array.from({ length: daysInMonth(leaveForm.selesaiBulan, leaveForm.selesaiTahun) }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <select className="form-input" style={{ fontSize: '0.82rem' }} value={leaveForm.selesaiBulan} onChange={e => { const b = +e.target.value; setLeaveForm(prev => ({ ...prev, selesaiBulan: b, selesaiHari: Math.min(prev.selesaiHari, daysInMonth(b, prev.selesaiTahun)) })); }}>
                    {BULAN_LIST.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                  <select className="form-input" style={{ fontSize: '0.82rem' }} value={leaveForm.selesaiTahun} onChange={e => setLeaveForm(prev => ({ ...prev, selesaiTahun: +e.target.value }))}>
                    {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              {/* Preview */}
              {computeTotalHari() > 0 && (
                <div style={{ padding: '0.55rem 0.9rem', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.18)', borderRadius: '7px', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  📋 Total izin: <strong>{computeTotalHari()} hari</strong>
                </div>
              )}
              {/* Keterangan */}
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Keterangan / Alasan</label>
                <input type="text" className="form-input" style={{ fontSize: '0.85rem' }} placeholder="Contoh: Sakit demam, izin keperluan keluarga..." value={leaveForm.keterangan} onChange={e => setLeaveForm(prev => ({ ...prev, keterangan: e.target.value }))} required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem', fontSize: '0.9rem', fontWeight: 700 }} disabled={submittingLeave || computeTotalHari() <= 0}>
                {submittingLeave ? 'Mengirim...' : `Kirim Pengajuan${computeTotalHari() > 0 ? ` (${computeTotalHari()} hari)` : ''}`}
              </button>
            </form>
          </div>

          {/* Riwayat Izin */}
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ width: '32px', height: '32px', background: 'rgba(99,102,241,0.12)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <CalendarDays size={16} />
              </div>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Status Pengajuan Izin</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Riwayat sakit &amp; cuti yang telah diajukan</p>
              </div>
            </div>
            {leaveHistory.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Belum ada laporan izin yang diajukan.
              </div>
            ) : (
              <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                <table className="table" style={{ fontSize: '0.83rem' }}>
                  <thead>
                    <tr>
                      <th>Tipe</th>
                      <th>Tanggal</th>
                      <th>Keterangan</th>
                      <th style={{ textAlign: 'right' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaveHistory.map((leave) => {
                      const statusMap: any = { DISETUJUI: ['#10b981', '✅ Disetujui'], DITOLAK: ['#ef4444', '❌ Ditolak'], PENDING: ['#eab308', '⏳ Pending'] };
                      const [sc, st] = statusMap[leave.status] || statusMap.PENDING;
                      return (
                        <tr key={leave.id}>
                          <td>
                            <span className={`badge ${leave.jenis === 'SAKIT' ? 'badge-warning' : 'badge-primary'}`} style={{ fontSize: '0.68rem' }}>
                              {leave.jenis === 'SAKIT' ? '🤒 Sakit' : '🏖️ Cuti'}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.75rem' }}>
                            <div style={{ color: 'var(--text-secondary)' }}>{leave.tanggalMulai}</div>
                            <div style={{ fontWeight: 600 }}>s.d {leave.tanggalSelesai}</div>
                          </td>
                          <td style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={leave.keterangan}>
                            {leave.keterangan}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <span style={{ display: 'inline-block', background: `${sc}18`, color: sc, border: `1px solid ${sc}35`, padding: '2px 8px', borderRadius: '5px', fontSize: '0.72rem', fontWeight: 700 }}>
                              {st}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TOAST */}
      {toastMessage && (
        <div className="no-print" style={{
          position: 'fixed', bottom: '2rem', right: '2rem',
          background: 'rgba(16,185,129,0.95)', color: '#fff',
          padding: '0.85rem 1.5rem', borderRadius: '10px',
          boxShadow: '0 10px 30px rgba(16,185,129,0.3)',
          display: 'flex', alignItems: 'center', gap: '0.6rem',
          zIndex: 9999, fontWeight: 600, fontSize: '0.88rem',
          animation: 'slideIn 0.3s ease-out',
          backdropFilter: 'blur(8px)',
        }}>
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        @keyframes slideIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </>
  );
}
