/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Printer, Search, FileText, CheckCircle2, AlertCircle, RefreshCw, Layers, X, Trash2 } from 'lucide-react';

interface Karyawan {
  id: string;
  nama: string;
  email: string;
  jabatan: string;
  namaBank: string;
  nomorRekening: string;
  gajiPokok: number;
  tunjanganJabatan: number;
}

interface PenggajianRecord {
  id: string;
  karyawanId: string;
  karyawan: Karyawan;
  bulan: number;
  tahun: number;
  gajiPokok: number;
  totalTunjangan: number;
  totalPotongan: number;
  pajakPPh21: number;
  gajiBersih: number;
  statusPembayaran: string; // TERTUNDA, LUNAS
  dibayarPada: string | null;
}

interface SelectedSlipDetails extends PenggajianRecord {
  kehadiran: {
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

export default function PenggajianPage() {
  const currentDate = new Date();
  const [selectedBulan, setSelectedBulan] = useState(currentDate.getMonth() + 1);
  const [selectedTahun, setSelectedTahun] = useState(currentDate.getFullYear());

  const [rekapGaji, setRekapGaji] = useState<PenggajianRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);


  // Slip modal state
  const [isSlipOpen, setIsSlipOpen] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState<SelectedSlipDetails | null>(null);
  const [loadingSlip, setLoadingSlip] = useState(false);

  // Clear payroll state
  const [isClearOpen, setIsClearOpen] = useState(false);
  const [clearMode, setClearMode] = useState<'period' | 'all'>('period');
  const [clearing, setClearing] = useState(false);

  const fetchPayroll = async () => {
    await Promise.resolve();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch(`/api/penggajian?bulan=${selectedBulan}&tahun=${selectedTahun}`);
      if (res.ok) {
        const data = await res.json();
        setRekapGaji(data);
      } else {
        const result = await res.json();
        setError(result.error || 'Gagal memuat rekapitulasi gaji.');
      }
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBulan, selectedTahun]);

  const handleProcessPayroll = async () => {
    if (!confirm(`Apakah Anda yakin ingin memproses atau melakukan kalkulasi ulang gaji seluruh karyawan untuk periode ${BULAN_LIST.find(m => m.value === selectedBulan)?.label} ${selectedTahun}?`)) {
      return;
    }

    setProcessing(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/penggajian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bulan: selectedBulan, tahun: selectedTahun }),
      });

      const result = await res.json();

      if (res.ok) {
        setMessage(result.message || 'Kalkulasi gaji berhasil diproses.');
        fetchPayroll();
      } else {
        setError(result.error || 'Gagal memproses gaji.');
      }
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan sistem saat memproses gaji.');
    } finally {
      setProcessing(false);
    }
  };

  const handleTogglePaymentStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'LUNAS' ? 'TERTUNDA' : 'LUNAS';
    try {
      const res = await fetch(`/api/penggajian/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statusPembayaran: nextStatus }),
      });

      if (res.ok) {
        setRekapGaji((prev) =>
          prev.map((item) =>
            item.id === id
              ? { ...item, statusPembayaran: nextStatus, dibayarPada: nextStatus === 'LUNAS' ? new Date().toISOString() : null }
              : item
          )
        );
        if (selectedSlip && selectedSlip.id === id) {
          setSelectedSlip((prev) => prev ? { ...prev, statusPembayaran: nextStatus } : null);
        }
      } else {
        alert('Gagal memperbarui status transaksi.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan koneksi.');
    }
  };

  const handleViewSlip = async (id: string) => {
    setIsSlipOpen(true);
    setLoadingSlip(true);
    setSelectedSlip(null);
    try {
      const res = await fetch(`/api/penggajian/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedSlip(data);
      } else {
        alert('Gagal mengambil rincian slip gaji.');
        setIsSlipOpen(false);
      }
    } catch (err) {
      console.error(err);
      alert('Kesalahan saat memuat data slip.');
      setIsSlipOpen(false);
    } finally {
      setLoadingSlip(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleClearPayroll = async () => {
    setClearing(true);
    setError('');
    setMessage('');
    try {
      const url = clearMode === 'all'
        ? '/api/penggajian?semua=1'
        : `/api/penggajian?bulan=${selectedBulan}&tahun=${selectedTahun}`;
      const res = await fetch(url, { method: 'DELETE' });
      const result = await res.json();
      if (res.ok) {
        setMessage(result.message);
        fetchPayroll();
      } else {
        setError(result.error || 'Gagal menghapus data penggajian.');
      }
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan jaringan.');
    } finally {
      setClearing(false);
      setIsClearOpen(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Nama Karyawan', 'Jabatan', 'Gaji Pokok', 'Total Tunjangan', 'Total Potongan', 'Pajak PPh 21', 'Gaji Bersih', 'Status Pembayaran'];
    const csvRows = [headers.join(',')];
    
    filteredPayrolls.forEach((p) => {
      const row = [
        `"${p.karyawan.nama.replace(/"/g, '""')}"`,
        `"${p.karyawan.jabatan.replace(/"/g, '""')}"`,
        p.gajiPokok,
        p.totalTunjangan,
        p.totalPotongan,
        p.pajakPPh21,
        p.gajiBersih,
        p.statusPembayaran
      ];
      csvRows.push(row.join(','));
    });
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const namaBulan = BULAN_LIST.find(m => m.value === selectedBulan)?.label || 'Bulan';
    link.setAttribute('download', `Rekap_Gaji_${namaBulan}_${selectedTahun}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const filteredPayrolls = rekapGaji.filter((p) =>
    p.karyawan.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.karyawan.jabatan.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPayrolls.length / rowsPerPage);
  const paginatedPayrolls = filteredPayrolls.slice(
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


  const totalExpense = rekapGaji.reduce((acc, curr) => acc + curr.gajiBersih, 0);
  const paidCount = rekapGaji.filter((p) => p.statusPembayaran === 'LUNAS').length;
  const pendingCount = rekapGaji.filter((p) => p.statusPembayaran === 'TERTUNDA').length;

  return (
    <>
      <div className="page-header no-print">
        <div className="page-title">
          <h1>Sistem Penggajian &amp; Slip Gaji</h1>
          <p>Kalkulasi gaji otomatis, potong asuransi kesehatan, BPJS, PPh 21, dan cetak slip gaji digital karyawan.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setIsClearOpen(true)}
            disabled={processing}
            className="btn btn-secondary no-print"
            style={{ border: '1px solid rgba(244,63,94,0.3)', color: 'var(--error)', background: 'rgba(244,63,94,0.06)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Trash2 size={16} />
            <span>Bersihkan Data</span>
          </button>
          <button
            onClick={handleProcessPayroll}
            disabled={processing}
            className="btn btn-primary"
          >
            {processing ? (
              <>
                <RefreshCw className="animate-spin" size={18} />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <DollarSign size={18} />
                <span>Hitung Gaji Periode Ini</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Message banners */}
      {message && (
        <div className="badge badge-success no-print" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.75rem', fontSize: '0.9rem' }}>
          <CheckCircle2 size={18} />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="badge badge-error no-print" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.75rem', fontSize: '0.9rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Filters & Rekap Summary */}
      <div className="glass-card no-print" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="form-group" style={{ width: '180px', marginBottom: 0 }}>
          <label className="form-label" style={{ marginBottom: '0.25rem' }}>Periode Bulan</label>
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
        <div className="form-group" style={{ width: '120px', marginBottom: 0 }}>
          <label className="form-label" style={{ marginBottom: '0.25rem' }}>Periode Tahun</label>
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
              placeholder="Cari karyawan..."
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
        <button onClick={fetchPayroll} className="btn btn-secondary" style={{ alignSelf: 'flex-end' }} title="Muat ulang">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* KPI stats */}
      <div className="kpi-grid no-print">
        <div className="glass-card kpi-card">
          <div className="kpi-details">
            <span>Total Pengeluaran Gaji Bersih</span>
            <h3>{formatIDR(totalExpense)}</h3>
          </div>
          <div className="kpi-icon success">
            <DollarSign size={24} />
          </div>
        </div>
        <div className="glass-card kpi-card">
          <div className="kpi-details">
            <span>Pembayaran Lunas</span>
            <h3>{paidCount} Karyawan</h3>
          </div>
          <div className="kpi-icon primary">
            <CheckCircle2 size={24} />
          </div>
        </div>
        <div className="glass-card kpi-card">
          <div className="kpi-details">
            <span>Pembayaran Tertunda</span>
            <h3>{pendingCount} Karyawan</h3>
          </div>
          <div className="kpi-icon warning">
            <AlertCircle size={24} />
          </div>
        </div>
      </div>

      {/* Rekap Table */}
      <div className="glass-card no-print">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Menyinkronkan data dengan Neon...
          </div>
        ) : filteredPayrolls.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Belum ada rekap gaji untuk periode ini. Silakan klik tombol <strong>&quot;Hitung Gaji Periode Ini&quot;</strong> di atas.
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nama Karyawan</th>
                  <th>Gaji Pokok</th>
                  <th>Total Tunjangan</th>
                  <th>Total Potongan</th>
                  <th>Pajak PPh 21</th>
                  <th>Gaji Bersih</th>
                  <th>Status Pembayaran</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPayrolls.map((payroll) => (
                  <tr key={payroll.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{payroll.karyawan.nama}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{payroll.karyawan.jabatan}</div>
                    </td>
                    <td>{formatIDR(payroll.gajiPokok)}</td>
                    <td>{formatIDR(payroll.totalTunjangan)}</td>
                    <td>{formatIDR(payroll.totalPotongan)}</td>
                    <td style={{ color: 'var(--error)' }}>{formatIDR(payroll.pajakPPh21)}</td>
                    <td style={{ fontWeight: 700, color: 'var(--success)' }}>{formatIDR(payroll.gajiBersih)}</td>
                    <td>
                      <button
                        onClick={() => handleTogglePaymentStatus(payroll.id, payroll.statusPembayaran)}
                        className={`badge ${payroll.statusPembayaran === 'LUNAS' ? 'badge-success' : 'badge-warning'}`}
                        style={{ cursor: 'pointer', border: '1px solid transparent' }}
                        title="Klik untuk ubah status"
                      >
                        {payroll.statusPembayaran === 'LUNAS' ? 'Lunas / Paid' : 'Tertunda / Pending'}
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleViewSlip(payroll.id)}
                        className="btn btn-secondary"
                        style={{ display: 'inline-flex', padding: '0.4rem 0.8rem', gap: '0.25rem', fontSize: '0.8rem' }}
                      >
                        <FileText size={14} />
                        <span>Slip Gaji</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!loading && filteredPayrolls.length > 0 && (
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
              Menampilkan <strong>{(currentPage - 1) * rowsPerPage + 1}</strong>–<strong>{Math.min(currentPage * rowsPerPage, filteredPayrolls.length)}</strong> dari <strong>{filteredPayrolls.length}</strong> karyawan
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


      {/* Slip Gaji Digital Modal */}
      {isSlipOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '850px', background: '#0a0d16' }}>
            <div className="modal-header no-print">
              <h2>Rincian Slip Gaji Digital</h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={handlePrint} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem' }}>
                  <Printer size={16} />
                  <span>Cetak Slip</span>
                </button>
                <button onClick={() => setIsSlipOpen(false)} className="close-btn">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="modal-body" style={{ background: '#080b11', padding: '2rem' }}>
              {loadingSlip || !selectedSlip ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Memuat rincian slip gaji...
                </div>
              ) : (
                <div className="slip-gaji-card">
                  <div className="slip-gaji-header">
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <Layers size={22} style={{ color: 'var(--primary)' }} />
                      <h2 style={{ letterSpacing: '2px' }}>PT. Nappz Teknologi Nusantara</h2>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Menara Teknologi Nusantara, Lt. 12, SCBD, Jakarta Selatan</p>
                    <h3 style={{ marginTop: '1.25rem', fontSize: '1.1rem', letterSpacing: '1px' }}>SLIP GAJI KARYAWAN</h3>
                    <p style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                      Periode: {BULAN_LIST.find(m => m.value === selectedSlip.bulan)?.label} {selectedSlip.tahun}
                    </p>
                  </div>

                  <div className="slip-meta-grid">
                    <div>
                      <div><strong>Nama Karyawan :</strong> {selectedSlip.karyawan.nama}</div>
                      <div><strong>ID Karyawan   :</strong> {selectedSlip.karyawanId.substring(0, 8)}...</div>
                      <div><strong>Jabatan       :</strong> {selectedSlip.karyawan.jabatan}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div><strong>Status Bayar :</strong> {selectedSlip.statusPembayaran === 'LUNAS' ? 'LUNAS / PAID' : 'TERTUNDA / PENDING'}</div>
                      <div><strong>Bank Transfer:</strong> {selectedSlip.karyawan.namaBank} - {selectedSlip.karyawan.nomorRekening}</div>
                      <div><strong>Tanggal Cetak:</strong> {new Date().toLocaleDateString('id-ID')}</div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.85rem', marginBottom: '1.5rem', padding: '0.5rem', border: '1px dashed #cbd5e1', borderRadius: '4px', color: '#475569' }}>
                    <strong>Rincian Kehadiran:</strong> Hadir: {selectedSlip.kehadiran.hariHadir} hari | Sakit: {selectedSlip.kehadiran.hariSakit} hari | Cuti: {selectedSlip.kehadiran.hariCuti} hari | Absen (Alpha): {selectedSlip.kehadiran.hariAlpha} hari
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    {/* EARNINGS */}
                    <div>
                      <div className="slip-section-title">Penerimaan / Earnings</div>
                      <div className="slip-item">
                        <span>Gaji Pokok</span>
                        <span>{formatIDR(selectedSlip.gajiPokok)}</span>
                      </div>
                      <div className="slip-item">
                        <span>Tunjangan Jabatan</span>
                        <span>{formatIDR(selectedSlip.karyawan.tunjanganJabatan)}</span>
                      </div>
                      <div className="slip-item">
                        <span>Tunjangan Kehadiran</span>
                        <span>{formatIDR(Math.max(0, selectedSlip.totalTunjangan - selectedSlip.karyawan.tunjanganJabatan))}</span>
                      </div>
                      <div className="slip-total">
                        <span>Total Gaji Kotor</span>
                        <span>{formatIDR(selectedSlip.gajiPokok + selectedSlip.totalTunjangan)}</span>
                      </div>
                    </div>

                    {/* DEDUCTIONS */}
                    <div>
                      <div className="slip-section-title">Potongan / Deductions</div>
                      
                      {selectedSlip.kehadiran.hariAlpha > 0 && (
                        <div className="slip-item">
                          <span>Potongan Absensi ({selectedSlip.kehadiran.hariAlpha} hari Alpha)</span>
                          <span>{formatIDR(Math.round((selectedSlip.gajiPokok / 22) * selectedSlip.kehadiran.hariAlpha))}</span>
                        </div>
                      )}
                      
                      <div className="slip-item">
                        <span>BPJS Kesehatan (1%)</span>
                        <span>{formatIDR(Math.round(selectedSlip.gajiPokok * 0.01))}</span>
                      </div>
                      <div className="slip-item">
                        <span>BPJS Ketenagakerjaan (2%)</span>
                        <span>{formatIDR(Math.round(selectedSlip.gajiPokok * 0.02))}</span>
                      </div>
                      <div className="slip-item" style={{ color: 'var(--error)' }}>
                        <span>Pajak Penghasilan (PPh 21)</span>
                        <span>{formatIDR(selectedSlip.pajakPPh21)}</span>
                      </div>
                      <div className="slip-total">
                        <span>Total Potongan</span>
                        <span>{formatIDR(selectedSlip.totalPotongan + selectedSlip.pajakPPh21)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="slip-total" style={{ fontSize: '1.2rem', marginTop: '2rem', borderTop: '2px solid var(--primary)', paddingTop: '1rem', color: 'var(--success)' }}>
                    <span>GAJI BERSIH (Net Take Home Pay)</span>
                    <span>{formatIDR(selectedSlip.gajiBersih)}</span>
                  </div>

                  <div className="slip-signatures" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
                      <p>Penerima,</p>
                      <div style={{ height: '4rem', marginTop: '0.5rem', marginBottom: '0.5rem' }}></div>
                      <span className="signature-line" style={{ fontSize: '0.8rem' }}>
                        {selectedSlip.karyawan.nama}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', textAlign: 'right' }}>
                      <p>HRD & Finance manager,</p>
                      <div style={{ height: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src="/signature-hrd.png" 
                          alt="Tanda Tangan HRD" 
                          style={{ maxHeight: '3.8rem', width: 'auto', objectFit: 'contain' }} 
                        />
                      </div>
                      <span className="signature-line" style={{ fontSize: '0.8rem' }}>
                        PT. Nappz Teknologi Nusantara
                      </span>
                    </div>
                  </div>

                  <div className="slip-gaji-footer">
                    <p>Terima kasih atas dedikasi dan kerja keras Anda.</p>
                    <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>Ini adalah dokumen sah yang diterbitkan secara elektronik oleh Sistem Payroll Nappz Teknologi.</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="modal-footer no-print">
              <button
                onClick={() => handleTogglePaymentStatus(selectedSlip!.id, selectedSlip!.statusPembayaran)}
                className={`btn ${selectedSlip?.statusPembayaran === 'LUNAS' ? 'btn-secondary' : 'btn-primary'}`}
              >
                {selectedSlip?.statusPembayaran === 'LUNAS' ? 'Batalkan Status Lunas' : 'Tandai Sebagai Lunas'}
              </button>
              <button onClick={() => setIsSlipOpen(false)} className="btn btn-secondary">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL KONFIRMASI BERSIHKAN DATA ─────────────────────── */}

      {isClearOpen && (
        <div className="modal-overlay no-print" onClick={() => setIsClearOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            {/* Header */}
            <div className="modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: 'rgba(244,63,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--error)' }}>
                  <Trash2 size={17} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Bersihkan Data Penggajian</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Tindakan ini tidak dapat dibatalkan</p>
                </div>
              </div>
              <button onClick={() => setIsClearOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '1.5rem 2rem' }}>
              {/* Warning box */}
              <div style={{ display: 'flex', gap: '0.75rem', padding: '0.85rem 1rem', borderRadius: '10px', background: 'rgba(244,63,94,0.07)', border: '1px solid rgba(244,63,94,0.18)', marginBottom: '1.5rem' }}>
                <AlertCircle size={18} style={{ color: 'var(--error)', flexShrink: 0, marginTop: '1px' }} />
                <p style={{ fontSize: '0.85rem', color: 'var(--error)', margin: 0, lineHeight: 1.5 }}>
                  Semua data penggajian yang dihapus <strong>tidak bisa dikembalikan</strong>. Pastikan Anda sudah mengekspor data sebelum melanjutkan.
                </p>
              </div>

              {/* Mode selection */}
              <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Pilih cakupan penghapusan:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {[
                  {
                    value: 'period' as const,
                    label: `Periode saat ini saja`,
                    sub: `${BULAN_LIST.find(m => m.value === selectedBulan)?.label} ${selectedTahun}`,
                  },
                  {
                    value: 'all' as const,
                    label: 'Semua periode (seluruh histori)',
                    sub: 'Hapus total seluruh data penggajian dari database',
                  },
                ].map(opt => (
                  <label key={opt.value} onClick={() => setClearMode(opt.value)} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                    padding: '0.85rem 1rem', borderRadius: '10px', cursor: 'pointer',
                    border: `1px solid ${clearMode === opt.value ? 'rgba(244,63,94,0.4)' : 'rgba(255,255,255,0.07)'}`,
                    background: clearMode === opt.value ? 'rgba(244,63,94,0.07)' : 'rgba(255,255,255,0.02)',
                    transition: 'all 0.2s ease',
                  }}>
                    <div style={{
                      width: '18px', height: '18px', borderRadius: '50%', border: `2px solid ${clearMode === opt.value ? 'var(--error)' : 'rgba(255,255,255,0.2)'}`,
                      background: clearMode === opt.value ? 'var(--error)' : 'transparent',
                      flexShrink: 0, marginTop: '1px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {clearMode === opt.value && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }} />}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.87rem', fontWeight: 600, color: '#fff', marginBottom: '0.15rem' }}>{opt.label}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{opt.sub}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={() => setIsClearOpen(false)} className="btn btn-secondary">
                Batal
              </button>
              <button
                onClick={handleClearPayroll}
                disabled={clearing}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.6rem 1.5rem', borderRadius: '10px',
                  background: 'rgba(244,63,94,0.15)', color: 'var(--error)',
                  border: '1px solid rgba(244,63,94,0.3)',
                  cursor: clearing ? 'not-allowed' : 'pointer',
                  fontWeight: 700, fontSize: '0.88rem',
                  fontFamily: 'var(--font-sans)',
                  opacity: clearing ? 0.7 : 1,
                }}
              >
                {clearing ? (
                  <>
                    <div style={{ width: '14px', height: '14px', border: '2px solid rgba(244,63,94,0.3)', borderTopColor: 'var(--error)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 size={15} />
                    Ya, Hapus Data
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }`}</style>
    </>
  );
}

