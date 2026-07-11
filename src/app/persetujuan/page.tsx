/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect } from 'react';
import { ClipboardList, CheckCircle2, Clock, Check, X, AlertCircle, CalendarDays, User, Trash2 } from 'lucide-react';

export default function PersetujuanPage() {
  const [pengajuanList, setPengajuanList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchPengajuan = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pengajuan-izin');
      if (res.ok) {
        const data = await res.json();
        setPengajuanList(data);
      } else {
        setError('Gagal memuat data pengajuan izin.');
      }
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPengajuan();
  }, []);

  const handleAction = async (id: string, status: 'DISETUJUI' | 'DITOLAK') => {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/pengajuan-izin/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      const result = await res.json();

      if (res.ok) {
        setToastMessage(`Pengajuan berhasil ${status.toLowerCase()}!`);
        setTimeout(() => setToastMessage(''), 3000);
        fetchPengajuan();
      } else {
        alert(result.error || 'Gagal mengubah status pengajuan.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setProcessingId(null);
    }
  };

  const getDaysCount = (startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleDeleteHistory = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus riwayat keputusan ini?')) {
      return;
    }
    try {
      const res = await fetch(`/api/pengajuan-izin/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setToastMessage('Riwayat keputusan berhasil dihapus!');
        setTimeout(() => setToastMessage(''), 3000);
        fetchPengajuan();
      } else {
        const result = await res.json();
        alert(result.error || 'Gagal menghapus riwayat keputusan.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan jaringan.');
    }
  };

  // KPI Calculations
  const pending = pengajuanList.filter((p) => p.status === 'PENDING');
  const approved = pengajuanList.filter((p) => p.status === 'DISETUJUI');
  const rejected = pengajuanList.filter((p) => p.status === 'DITOLAK');

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h1>Persetujuan Izin & Sakit</h1>
          <p>Tinjau dan proses permohonan izin atau sakit yang diajukan oleh karyawan.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid" style={{ marginTop: '1.5rem' }}>
        <div className="glass-card kpi-card">
          <div className="kpi-details">
            <span>Izin Pending</span>
            <h3>{pending.length} Permohonan</h3>
          </div>
          <div className="kpi-icon warning">
            <Clock size={24} />
          </div>
        </div>
        <div className="glass-card kpi-card">
          <div className="kpi-details">
            <span>Izin Disetujui</span>
            <h3>{approved.length} Pengajuan</h3>
          </div>
          <div className="kpi-icon success">
            <CheckCircle2 size={24} />
          </div>
        </div>
        <div className="glass-card kpi-card">
          <div className="kpi-details">
            <span>Izin Ditolak</span>
            <h3>{rejected.length} Pengajuan</h3>
          </div>
          <div className="kpi-icon error">
            <AlertCircle size={24} />
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Memuat daftar pengajuan...
        </div>
      ) : error ? (
        <div className="badge badge-error" style={{ padding: '1rem', width: '100%', fontSize: '1rem', marginTop: '2rem' }}>
          {error}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '2rem' }}>
          
          {/* Section: Pending Board */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem' }}>
              <div style={{ background: 'var(--primary-glow)', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <ClipboardList size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Menunggu Persetujuan</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Daftar izin baru yang masuk</p>
              </div>
            </div>

            {pending.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                🎉 Semua permohonan izin telah diproses. Tidak ada permohonan tertunda!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {pending.map((p) => {
                  const duration = getDaysCount(p.tanggalMulai, p.tanggalSelesai);
                  return (
                    <div 
                      key={p.id} 
                      style={{ 
                        background: 'rgba(255, 255, 255, 0.02)', 
                        border: '1px solid rgba(255, 255, 255, 0.05)', 
                        borderRadius: '8px', 
                        padding: '1.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '1.5rem'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        <div style={{ background: 'rgba(255,255,255,0.05)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                          <User size={20} />
                        </div>
                        <div>
                          <h4 style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{p.karyawan.nama}</h4>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.karyawan.jabatan} • {p.karyawan.email}</p>
                          
                          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', fontSize: '0.85rem' }}>
                            <div>
                              <span style={{ color: 'var(--text-secondary)' }}>Jenis Izin:</span>{' '}
                              <span className={`badge ${p.jenis === 'SAKIT' ? 'badge-warning' : 'badge-primary'}`}>
                                {p.jenis}
                              </span>
                            </div>
                            <div>
                              <span style={{ color: 'var(--text-secondary)' }}>Durasi:</span>{' '}
                              <strong style={{ color: '#fff' }}>{duration} hari</strong> ({p.tanggalMulai} s.d {p.tanggalSelesai})
                            </div>
                          </div>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.5rem 0.75rem', borderRadius: '4px', borderLeft: '3px solid var(--primary)' }}>
                            💬 Alasan: &ldquo;{p.keterangan}&rdquo;
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                          onClick={() => handleAction(p.id, 'DITOLAK')}
                          className="btn btn-secondary"
                          style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 1rem', borderColor: '#ef4444', color: '#ef4444', background: 'rgba(239, 68, 68, 0.05)' }}
                          disabled={processingId === p.id}
                        >
                          <X size={16} />
                          <span>Tolak</span>
                        </button>
                        <button
                          onClick={() => handleAction(p.id, 'DISETUJUI')}
                          className="btn btn-primary"
                          style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 1rem', background: 'var(--success)', borderColor: 'var(--success)' }}
                          disabled={processingId === p.id}
                        >
                          <Check size={16} />
                          <span>Setujui</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section: History Board */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem' }}>
              <div style={{ background: 'var(--primary-glow)', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <CalendarDays size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Riwayat Keputusan</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Laporan izin yang sudah diproses</p>
              </div>
            </div>

            {approved.length === 0 && rejected.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Belum ada permohonan yang diproses.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table" style={{ fontSize: '0.85rem' }}>
                  <thead>
                    <tr>
                      <th>Karyawan</th>
                      <th>Jenis</th>
                      <th>Tanggal / Periode</th>
                      <th>Keterangan</th>
                      <th>Status Keputusan</th>
                      <th style={{ textAlign: 'right' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pengajuanList
                      .filter((p) => p.status !== 'PENDING')
                      .map((p) => {
                        const badgeColor = p.status === 'DISETUJUI' ? '#10b981' : '#ef4444';
                        return (
                          <tr key={p.id}>
                            <td>
                              <strong>{p.karyawan.nama}</strong>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{p.karyawan.jabatan}</div>
                            </td>
                            <td>
                              <span className={`badge ${p.jenis === 'SAKIT' ? 'badge-warning' : 'badge-primary'}`}>
                                {p.jenis}
                              </span>
                            </td>
                            <td>
                              <div><strong>{getDaysCount(p.tanggalMulai, p.tanggalSelesai)} hari</strong></div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>({p.tanggalMulai} s.d {p.tanggalSelesai})</div>
                            </td>
                            <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={p.keterangan}>
                              {p.keterangan}
                            </td>
                            <td>
                              <span style={{ 
                                display: 'inline-block', 
                                background: `${badgeColor}20`, 
                                color: badgeColor, 
                                border: `1px solid ${badgeColor}40`,
                                padding: '3px 10px', 
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 700
                              }}>
                                {p.status}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <button
                                onClick={() => handleDeleteHistory(p.id)}
                                style={{ 
                                  padding: '0.4rem', 
                                  display: 'inline-flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center', 
                                  background: 'rgba(244, 63, 94, 0.1)', 
                                  color: 'var(--error)', 
                                  border: '1px solid rgba(244, 63, 94, 0.2)', 
                                  cursor: 'pointer', 
                                  borderRadius: '6px' 
                                }}
                                title="Hapus Riwayat"
                              >
                                <Trash2 size={14} />
                              </button>
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

      {/* TOAST SUCCESS */}
      {toastMessage && (
        <div className="no-print" style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          background: 'rgba(16, 185, 129, 0.95)',
          color: '#fff',
          padding: '0.85rem 1.5rem',
          borderRadius: '8px',
          boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4), 0 0 15px rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          zIndex: 9999,
          animation: 'slideIn 0.3s ease-out',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.1)',
          fontWeight: 600
        }}>
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
}
