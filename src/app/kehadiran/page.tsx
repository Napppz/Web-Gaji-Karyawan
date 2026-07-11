/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect } from 'react';
import { Calendar, Search, Edit3, X, RefreshCw, CheckCircle2 } from 'lucide-react';

interface KehadiranRecord {
  karyawanId: string;
  nama: string;
  email: string;
  jabatan: string;
  gajiPokok: number;
  tunjanganJabatan: number;
  kehadiran: {
    id: string | null;
    hariHadir: number;
    hariSakit: number;
    hariCuti: number;
    hariAlpha: number;
  };
}

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

const TAHUN_LIST = [2025, 2026, 2027];

export default function KehadiranPage() {
  const currentDate = new Date();
  const [selectedBulan, setSelectedBulan] = useState(currentDate.getMonth() + 1); // 1-12
  const [selectedTahun, setSelectedTahun] = useState(currentDate.getFullYear());
  
  const [records, setRecords] = useState<KehadiranRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);


  // Editing state
  const [editingRecord, setEditingRecord] = useState<KehadiranRecord | null>(null);
  const [formData, setFormData] = useState({
    hariHadir: 22,
    hariSakit: 0,
    hariCuti: 0,
    hariAlpha: 0,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const fetchKehadiran = async () => {
    await Promise.resolve();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/kehadiran?bulan=${selectedBulan}&tahun=${selectedTahun}`);
      if (res.ok) {
        const data = await res.json();
        setRecords(data);
      } else {
        const result = await res.json();
        setError(result.error || 'Gagal mengambil data kehadiran.');
      }
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKehadiran();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBulan, selectedTahun]);

  const openEditModal = (rec: KehadiranRecord) => {
    setEditingRecord(rec);
    setFormData({
      hariHadir: rec.kehadiran.id ? rec.kehadiran.hariHadir : 22,
      hariSakit: rec.kehadiran.id ? rec.kehadiran.hariSakit : 0,
      hariCuti: rec.kehadiran.id ? rec.kehadiran.hariCuti : 0,
      hariAlpha: rec.kehadiran.id ? rec.kehadiran.hariAlpha : 0,
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    setError('');
    const payload = {
      karyawanId: editingRecord.karyawanId,
      bulan: selectedBulan,
      tahun: selectedTahun,
      hariHadir: formData.hariHadir,
      hariSakit: formData.hariSakit,
      hariCuti: formData.hariCuti,
      hariAlpha: formData.hariAlpha,
    };

    try {
      const res = await fetch('/api/kehadiran', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchKehadiran();
        setToastMessage('Data absensi berhasil diperbarui!');
        setTimeout(() => setToastMessage(''), 3000);
      } else {
        const result = await res.json();
        setError(result.error || 'Gagal menyimpan kehadiran.');
      }
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan sistem.');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Nama Karyawan', 'Email', 'Jabatan', 'Hari Hadir', 'Hari Sakit', 'Hari Cuti', 'Hari Alpha', 'Status Input'];
    const csvRows = [headers.join(',')];
    
    filteredRecords.forEach((rec) => {
      const row = [
        `"${rec.nama.replace(/"/g, '""')}"`,
        `"${rec.email.replace(/"/g, '""')}"`,
        `"${rec.jabatan.replace(/"/g, '""')}"`,
        rec.kehadiran.hariHadir,
        rec.kehadiran.hariSakit,
        rec.kehadiran.hariCuti,
        rec.kehadiran.hariAlpha,
        rec.kehadiran.id ? 'Tercatat' : 'Belum Diisi'
      ];
      csvRows.push(row.join(','));
    });
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const namaBulan = BULAN_LIST.find(m => m.value === selectedBulan)?.label || 'Bulan';
    link.setAttribute('download', `Rekap_Kehadiran_${namaBulan}_${selectedTahun}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRecords = records.filter((rec) =>
    rec.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rec.jabatan.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRecords.length / rowsPerPage);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleSearch = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const paginBtnStyle = (disabled: boolean): React.CSSProperties => ({
    padding: '0.35rem 0.65rem',
    borderRadius: '8px',
    border: '1px solid var(--border-light)',
    background: 'rgba(255,255,255,0.04)',
    color: disabled ? 'var(--text-muted)' : 'var(--text-secondary)',
    fontSize: '0.82rem',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.4 : 1,
    transition: 'all 0.15s',
    minWidth: '32px',
    textAlign: 'center' as const,
  });


  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h1>Pencatatan Kehadiran Karyawan</h1>
          <p>Catat absensi hadir, sakit, cuti, dan alpha bulanan untuk menghitung tunjangan makan dan denda potongan absensi.</p>
        </div>
      </div>

      {/* Date Selectors & Filters */}
      <div className="glass-card" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="form-group" style={{ width: '180px', marginBottom: 0 }}>
          <label className="form-label" style={{ marginBottom: '0.25rem' }}>Pilih Periode Bulan</label>
          <select
            className="form-input"
            value={selectedBulan}
            onChange={(e) => setSelectedBulan(parseInt(e.target.value))}
          >
            {BULAN_LIST.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
        <div className="form-group" style={{ width: '130px', marginBottom: 0 }}>
          <label className="form-label" style={{ marginBottom: '0.25rem' }}>Pilih Tahun</label>
          <select
            className="form-input"
            value={selectedTahun}
            onChange={(e) => setSelectedTahun(parseInt(e.target.value))}
          >
            {TAHUN_LIST.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div className="form-group" style={{ flex: 1, minWidth: '220px', marginBottom: 0, alignSelf: 'flex-end' }}>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-secondary)' }} size={18} />
            <input
              type="text"
              placeholder="Cari nama karyawan..."
              className="form-input"
              style={{ paddingLeft: '40px' }}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <span>Tampilkan:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)',
              borderRadius: '8px', color: 'var(--text-primary)', padding: '0.4rem 0.6rem',
              fontSize: '0.85rem', cursor: 'pointer',
            }}
          >
            {[10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <span>baris</span>
        </div>
        <button onClick={handleExportCSV} className="btn btn-secondary" style={{ alignSelf: 'flex-end', display: 'inline-flex', gap: '0.25rem' }} title="Ekspor Rekap CSV">
          <span>Ekspor CSV</span>
        </button>
        <button onClick={fetchKehadiran} className="btn btn-secondary" style={{ alignSelf: 'flex-end' }} title="Refresh">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Attendance Spreadsheet Card */}
      <div className="glass-card">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Menghubungkan ke server...
          </div>
        ) : error ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--error)' }}>
            {error}
          </div>
        ) : filteredRecords.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Tidak ada karyawan terdaftar di sistem.
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nama Karyawan</th>
                  <th>Jabatan</th>
                  <th style={{ textAlign: 'center' }}>Hari Hadir</th>
                  <th style={{ textAlign: 'center' }}>Hari Sakit</th>
                  <th style={{ textAlign: 'center' }}>Hari Cuti</th>
                  <th style={{ textAlign: 'center' }}>Hari Alpha</th>
                  <th style={{ textAlign: 'center' }}>Status Input</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRecords.map((rec) => (
                  <tr key={rec.karyawanId}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{rec.nama}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{rec.email}</div>
                    </td>
                    <td>{rec.jabatan}</td>
                    <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--success)' }}>
                      {rec.kehadiran.hariHadir} Hari
                    </td>
                    <td style={{ textAlign: 'center', color: 'var(--info)' }}>
                      {rec.kehadiran.hariSakit} Hari
                    </td>
                    <td style={{ textAlign: 'center', color: 'var(--warning)' }}>
                      {rec.kehadiran.hariCuti} Hari
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 600, color: rec.kehadiran.hariAlpha > 0 ? 'var(--error)' : 'var(--text-secondary)' }}>
                      {rec.kehadiran.hariAlpha} Hari
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${rec.kehadiran.id ? 'badge-success' : 'badge-warning'}`}>
                        {rec.kehadiran.id ? 'Tercatat' : 'Belum Diisi'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => openEditModal(rec)}
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'inline-flex', padding: '0.4rem 0.8rem', gap: '0.25rem', fontSize: '0.8rem' }}
                      >
                        <Edit3 size={14} />
                        <span>Isi Absensi</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!loading && filteredRecords.length > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '1.25rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-light)',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}>
            {/* Info */}
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Menampilkan <strong>{(currentPage - 1) * rowsPerPage + 1}</strong>–<strong>{Math.min(currentPage * rowsPerPage, filteredRecords.length)}</strong> dari <strong>{filteredRecords.length}</strong> karyawan
            </span>

            {/* Page controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                style={paginBtnStyle(currentPage === 1)}
              >«</button>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={paginBtnStyle(currentPage === 1)}
              >‹</button>

              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
                const page = start + i;
                if (page > totalPages) return null;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    style={{
                      ...paginBtnStyle(false),
                      background: page === currentPage ? 'var(--primary)' : 'rgba(255,255,255,0.04)',
                      color: page === currentPage ? '#fff' : 'var(--text-secondary)',
                      fontWeight: page === currentPage ? 700 : 400,
                      borderColor: page === currentPage ? 'var(--primary)' : 'var(--border-light)',
                    }}
                  >{page}</button>
                );
              })}

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={paginBtnStyle(currentPage === totalPages)}
              >›</button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                style={paginBtnStyle(currentPage === totalPages)}
              >»</button>
            </div>
          </div>
        )}
      </div>


      {/* Input Attendance Modal */}
      {isModalOpen && editingRecord && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Catat Kehadiran: {editingRecord.nama}</h2>
              <button onClick={() => setIsModalOpen(false)} className="close-btn">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)' }}>
                  <Calendar size={18} className="text-primary" />
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Periode: <strong>{BULAN_LIST.find(m => m.value === selectedBulan)?.label} {selectedTahun}</strong>
                  </span>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Hari Hadir (Present) *</label>
                    <input
                      type="number"
                      name="hariHadir"
                      min="0"
                      max="31"
                      className="form-input"
                      value={formData.hariHadir}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Hari Sakit (Sick) *</label>
                    <input
                      type="number"
                      name="hariSakit"
                      min="0"
                      max="31"
                      className="form-input"
                      value={formData.hariSakit}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Hari Cuti (Paid Leave) *</label>
                    <input
                      type="number"
                      name="hariCuti"
                      min="0"
                      max="31"
                      className="form-input"
                      value={formData.hariCuti}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Absen Tanpa Keterangan (Alpha) *</label>
                    <input
                      type="number"
                      name="hariAlpha"
                      min="0"
                      max="31"
                      className="form-input"
                      value={formData.hariAlpha}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'right', marginTop: '0.5rem' }}>
                  Total Hari di Form: <strong>{formData.hariHadir + formData.hariSakit + formData.hariCuti + formData.hariAlpha} hari</strong>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan Absensi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
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
