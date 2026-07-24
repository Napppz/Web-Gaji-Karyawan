/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, RefreshCw, Briefcase, DollarSign, Users, CheckCircle2, Upload } from 'lucide-react';


interface Karyawan {
  id: string;
  nama: string;
  email: string;
  password?: string;
  jabatan: string;
  statusKerja: string; // TETAP, KONTRAK
  gajiPokok: number;
  tunjanganJabatan: number;
  nomorRekening: string;
  namaBank: string;
}

export default function KaryawanPage() {
  const [daftarKaryawan, setDaftarKaryawan] = useState<Karyawan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKaryawan, setEditingKaryawan] = useState<Karyawan | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // CSV Upload States
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [clearExisting, setClearExisting] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');


  
  // Form State
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    password: '',
    jabatan: 'Staff Admin',
    statusKerja: 'TETAP',
    gajiPokok: '',
    tunjanganJabatan: '0',
    nomorRekening: '',
    namaBank: 'BCA',
  });
  const [error, setError] = useState('');

  const fetchKaryawan = async () => {
    await Promise.resolve();
    setLoading(true);
    try {
      const res = await fetch('/api/karyawan');
      if (res.ok) {
        const data = await res.json();
        setDaftarKaryawan(data);
      } else {
        setError('Gagal mengambil data karyawan.');
      }
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKaryawan();
  }, []);

  const openAddModal = () => {
    setEditingKaryawan(null);
    setFormData({
      nama: '',
      email: '',
      password: '',
      jabatan: 'Staff Admin',
      statusKerja: 'TETAP',
      gajiPokok: '',
      tunjanganJabatan: '0',
      nomorRekening: '',
      namaBank: 'BCA',
    });
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (kar: Karyawan) => {
    setEditingKaryawan(kar);
    setFormData({
      nama: kar.nama,
      email: kar.email,
      password: '',
      jabatan: kar.jabatan,
      statusKerja: kar.statusKerja,
      gajiPokok: kar.gajiPokok.toString(),
      tunjanganJabatan: kar.tunjanganJabatan.toString(),
      nomorRekening: kar.nomorRekening,
      namaBank: kar.namaBank,
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.nama || !formData.email || !formData.gajiPokok || !formData.nomorRekening) {
      setError('Harap isi semua field yang wajib.');
      return;
    }

    // 1. Validasi Format Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Format email tidak valid (contoh: nama@perusahaan.com).');
      return;
    }

    // 2. Validasi Nomor Rekening (Hanya Angka & Panjang 8 - 18 digit)
    const accountRegex = /^\d+$/;
    if (!accountRegex.test(formData.nomorRekening)) {
      setError('Nomor rekening hanya boleh berisi angka.');
      return;
    }
    if (formData.nomorRekening.length < 8 || formData.nomorRekening.length > 18) {
      setError('Nomor rekening harus terdiri dari 8 hingga 18 digit.');
      return;
    }

    // 3. Validasi Nominal Gaji & Tunjangan
    const salaryVal = parseFloat(formData.gajiPokok);
    if (isNaN(salaryVal) || salaryVal < 1000000) {
      setError('Gaji pokok minimum adalah Rp 1.000.000.');
      return;
    }
    const allowanceVal = parseFloat(formData.tunjanganJabatan || '0');
    if (isNaN(allowanceVal) || allowanceVal < 0) {
      setError('Tunjangan jabatan tidak boleh bernilai negatif.');
      return;
    }

    const payload: Partial<Karyawan> & { gajiPokok: number; tunjanganJabatan: number } = {
      ...formData,
      gajiPokok: salaryVal,
      tunjanganJabatan: allowanceVal,
    };

    if (editingKaryawan && !formData.password) {
      delete payload.password;
    }

    try {
      const url = editingKaryawan ? `/api/karyawan/${editingKaryawan.id}` : '/api/karyawan';
      const method = editingKaryawan ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok) {
        setIsModalOpen(false);
        fetchKaryawan();
        setToastMessage(editingKaryawan ? 'Data karyawan berhasil diperbarui!' : 'Karyawan baru berhasil ditambahkan!');
        setTimeout(() => setToastMessage(''), 3000);
      } else {
        setError(result.error || 'Gagal menyimpan data.');
      }
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan sistem.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus karyawan ini? Seluruh data absensi dan slip gaji terkait juga akan terhapus secara permanen.')) {
      return;
    }

    try {
      const res = await fetch(`/api/karyawan/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchKaryawan();
        setToastMessage('Data karyawan berhasil dihapus!');
        setTimeout(() => setToastMessage(''), 3000);
      } else {
        const result = await res.json();
        alert(result.error || 'Gagal menghapus karyawan.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menghapus.');
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm('PERHATIAN! Apakah Anda yakin ingin menghapus SEMUA data karyawan? Seluruh data absensi dan slip gaji terkait di database akan dikosongkan permanen.')) {
      return;
    }

    try {
      const res = await fetch('/api/karyawan', { method: 'DELETE' });
      const result = await res.json();
      if (res.ok) {
        fetchKaryawan();
        setToastMessage(result.message || 'Semua data karyawan berhasil dihapus!');
        setTimeout(() => setToastMessage(''), 3000);
      } else {
        alert(result.error || 'Gagal menghapus seluruh karyawan.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menghapus semua data.');
    }
  };


  const handleExportCSV = () => {
    const headers = ['ID Karyawan', 'Nama Lengkap', 'Email', 'Jabatan', 'Status Kerja', 'Gaji Pokok', 'Tunjangan Jabatan', 'Nama Bank', 'Nomor Rekening'];
    const csvRows = [headers.join(',')];
    
    filteredKaryawan.forEach((kar) => {
      const row = [
        `"${kar.id}"`,
        `"${kar.nama.replace(/"/g, '""')}"`,
        `"${kar.email.replace(/"/g, '""')}"`,
        `"${kar.jabatan.replace(/"/g, '""')}"`,
        `"${kar.statusKerja}"`,
        kar.gajiPokok,
        kar.tunjanganJabatan,
        `"${kar.namaBank}"`,
        `"${kar.nomorRekening}"`
      ];
      csvRows.push(row.join(','));
    });
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Data_Karyawan_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredKaryawan = daftarKaryawan.filter((kar) => {
    const matchesSearch = kar.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          kar.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          kar.jabatan.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter ? kar.statusKerja === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredKaryawan.length / rowsPerPage);
  const paginatedKaryawan = filteredKaryawan.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleSearch = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleStatusFilter = (val: string) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  const handleUploadCSV = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setUploadLoading(true);
    setUploadMessage('');

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('clearExisting', clearExisting.toString());

      const res = await fetch('/api/karyawan/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        setUploadMessage(`Sukses: ${result.summary.berhasil} berhasil, ${result.summary.gagal} gagal.`);
        fetchKaryawan();
        setTimeout(() => {
          setIsUploadModalOpen(false);
          setUploadFile(null);
          setUploadMessage('');
          setClearExisting(false);
        }, 3000);
      } else {
        setUploadMessage(`Error: ${result.error}`);
      }
    } catch {
      setUploadMessage('Terjadi kesalahan koneksi server.');
    } finally {
      setUploadLoading(false);
    }
  };



  const totalKaryawan = daftarKaryawan.length;
  const tetapCount = daftarKaryawan.filter((e) => e.statusKerja === 'TETAP').length;
  const kontrakCount = daftarKaryawan.filter((e) => e.statusKerja === 'KONTRAK').length;

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
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
          <h1>Manajemen Data Karyawan</h1>
          <p>Kelola profil lengkap karyawan, jabatan, sistem rekening transfer, dan gaji pokok tetap.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={handleDeleteAll} className="btn btn-secondary" style={{ display: 'inline-flex', gap: '0.4rem', border: '1px solid rgba(239,68,68,0.25)', color: 'var(--error)', background: 'rgba(239,68,68,0.06)' }} title="Kosongkan Database Karyawan">
            <Trash2 size={18} />
            <span>Hapus Semua</span>
          </button>
          <button onClick={() => setIsUploadModalOpen(true)} className="btn btn-secondary" style={{ display: 'inline-flex', gap: '0.4rem', border: '1px solid rgba(99,102,241,0.25)', color: 'var(--primary)', background: 'rgba(99,102,241,0.06)' }}>
            <Upload size={18} />
            <span>Upload CSV</span>
          </button>
          <button onClick={openAddModal} className="btn btn-primary">
            <Plus size={18} />
            <span>Tambah Karyawan</span>
          </button>
        </div>
      </div>


      {/* Stats Summary */}
      <div className="kpi-grid">
        <div className="glass-card kpi-card">
          <div className="kpi-details">
            <span>Total SDM Terdaftar</span>
            <h3>{totalKaryawan} Orang</h3>
          </div>
          <div className="kpi-icon primary">
            <Users size={24} />
          </div>
        </div>
        <div className="glass-card kpi-card">
          <div className="kpi-details">
            <span>Karyawan Tetap</span>
            <h3>{tetapCount} Orang</h3>
          </div>
          <div className="kpi-icon success">
            <Briefcase size={24} />
          </div>
        </div>
        <div className="glass-card kpi-card">
          <div className="kpi-details">
            <span>Karyawan Kontrak</span>
            <h3>{kontrakCount} Orang</h3>
          </div>
          <div className="kpi-icon warning">
            <DollarSign size={24} />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="form-group" style={{ flex: 1, minWidth: '250px', marginBottom: 0 }}>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-secondary)' }} size={18} />
            <input
              type="text"
              placeholder="Cari karyawan berdasarkan nama, email, jabatan..."
              className="form-input"
              style={{ paddingLeft: '40px' }}
              value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="form-group" style={{ width: '200px', marginBottom: 0 }}>
        <select
          className="form-input"
          value={statusFilter}
          onChange={(e) => handleStatusFilter(e.target.value)}
        >
          <option value="">Semua Status Kerja</option>
          <option value="TETAP">Karyawan Tetap (TETAP)</option>
          <option value="KONTRAK">Karyawan Kontrak (KONTRAK)</option>
        </select>
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

        <button onClick={handleExportCSV} className="btn btn-secondary" style={{ display: 'inline-flex', gap: '0.25rem' }} title="Ekspor Data Karyawan CSV">
          <span>Ekspor CSV</span>
        </button>
        <button onClick={fetchKaryawan} className="btn btn-secondary" title="Muat ulang data">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Employees Table */}
      <div className="glass-card">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Sedang menyinkronkan data database...
          </div>
        ) : filteredKaryawan.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Tidak ada karyawan ditemukan dalam database Neon.
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nama & Email</th>
                  <th>Jabatan</th>
                  <th>Status Kerja</th>
                  <th>Gaji Pokok</th>
                  <th>Tunjangan Jabatan</th>
                  <th>Sistem Pembayaran</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedKaryawan.map((kar) => (

                  <tr key={kar.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{kar.nama}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{kar.email}</div>
                    </td>
                    <td>{kar.jabatan}</td>
                    <td>
                      <span className={`badge ${kar.statusKerja === 'TETAP' ? 'badge-success' : 'badge-warning'}`}>
                        {kar.statusKerja === 'TETAP' ? 'Tetap' : 'Kontrak'}
                      </span>
                    </td>
                    <td>{formatIDR(kar.gajiPokok)}</td>
                    <td>{formatIDR(kar.tunjanganJabatan)}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{kar.namaBank}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>No. Rek: {kar.nomorRekening}</div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => openEditModal(kar)}
                          className="btn btn-secondary"
                          style={{ padding: '0.4rem' }}
                          title="Edit Profile"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(kar.id)}
                          className="btn btn-danger"
                          style={{ padding: '0.4rem' }}
                          title="Hapus Data"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!loading && filteredKaryawan.length > 0 && (
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
              Menampilkan <strong>{(currentPage - 1) * rowsPerPage + 1}</strong>–<strong>{Math.min(currentPage * rowsPerPage, filteredKaryawan.length)}</strong> dari <strong>{filteredKaryawan.length}</strong> karyawan
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


      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingKaryawan ? 'Edit Profil Karyawan' : 'Tambah Karyawan Baru'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="close-btn">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && (
                  <div className="badge badge-error" style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }}>
                    {error}
                  </div>
                )}
                
                <div className="form-group">
                  <label className="form-label">Nama Lengkap *</label>
                  <input
                    type="text"
                    name="nama"
                    className="form-input"
                    placeholder="Nama Lengkap Karyawan"
                    value={formData.nama}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Alamat Email Resmi *</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    placeholder="email@perusahaan.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Kata Sandi Login {editingKaryawan ? '' : '*'}</label>
                  <input
                    type="text"
                    name="password"
                    className="form-input"
                    placeholder={editingKaryawan ? "Kosongkan jika tidak ingin mengubah kata sandi" : "Kata sandi login (default: karyawan123)"}
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!editingKaryawan}
                  />
                  {editingKaryawan && (
                    <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                      * Kosongkan jika kata sandi tidak ingin diubah.
                    </small>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Jabatan Struktural *</label>
                    <select
                      name="jabatan"
                      className="form-input"
                      value={formData.jabatan}
                      onChange={handleInputChange}
                    >
                      <option value="Manager">Manager</option>
                      <option value="HR Specialist">HR Specialist</option>
                      <option value="Senior Developer">Senior Developer</option>
                      <option value="Software Engineer">Software Engineer</option>
                      <option value="QA Engineer">QA Engineer</option>
                      <option value="Staff Admin">Staff Admin</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status Ketenagakerjaan *</label>
                    <select
                      name="statusKerja"
                      className="form-input"
                      value={formData.statusKerja}
                      onChange={handleInputChange}
                    >
                      <option value="TETAP">Karyawan Tetap (TETAP)</option>
                      <option value="KONTRAK">Karyawan Kontrak (KONTRAK)</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Gaji Pokok (Rupiah) *</label>
                    <input
                      type="number"
                      name="gajiPokok"
                      className="form-input"
                      placeholder="Contoh: 7500000"
                      value={formData.gajiPokok}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tunjangan Jabatan (Rupiah)</label>
                    <input
                      type="number"
                      name="tunjanganJabatan"
                      className="form-input"
                      placeholder="Contoh: 1000000"
                      value={formData.tunjanganJabatan}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Nama Bank Transfer *</label>
                    <select
                      name="namaBank"
                      className="form-input"
                      value={formData.namaBank}
                      onChange={handleInputChange}
                    >
                      <option value="BCA">Bank BCA</option>
                      <option value="Mandiri">Bank Mandiri</option>
                      <option value="BNI">Bank BNI</option>
                      <option value="BRI">Bank BRI</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nomor Rekening Penerima *</label>
                    <input
                      type="text"
                      name="nomorRekening"
                      className="form-input"
                      placeholder="Contoh: 524109xxx"
                      value={formData.nomorRekening}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Upload Modal */}
      {isUploadModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h2>Upload Dataset Karyawan (CSV)</h2>
              <button onClick={() => setIsUploadModalOpen(false)} className="close-btn" disabled={uploadLoading}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUploadCSV}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {uploadMessage && (
                  <div className={`badge ${uploadMessage.startsWith('Error') ? 'badge-error' : 'badge-success'}`} style={{ width: '100%', padding: '0.75rem', fontSize: '0.85rem', whiteSpace: 'normal', lineHeight: 1.4 }}>
                    {uploadMessage}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Pilih File CSV *</label>
                  <input
                    type="file"
                    accept=".csv"
                    className="form-input"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    required
                    disabled={uploadLoading}
                  />
                  <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.35rem', lineHeight: 1.4 }}>
                    Dukung format dataset Kaggle fiktif Indonesia. Kolom minimum yang wajib ada: <strong>Nama</strong>, <strong>Jabatan</strong>, dan <strong>Gaji</strong>.
                  </small>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                  <input
                    type="checkbox"
                    id="clear-checkbox"
                    checked={clearExisting}
                    onChange={(e) => setClearExisting(e.target.checked)}
                    disabled={uploadLoading}
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                  <label htmlFor="clear-checkbox" style={{ fontSize: '0.82rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                    Bersihkan / Kosongkan data database lama sebelum import
                  </label>
                </div>

              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsUploadModalOpen(false)} className="btn btn-secondary" disabled={uploadLoading}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" disabled={uploadLoading || !uploadFile} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Upload size={16} />
                  <span>{uploadLoading ? 'Mengimport...' : 'Import Dataset'}</span>
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
