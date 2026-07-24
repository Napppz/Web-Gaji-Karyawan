/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect } from 'react';
import { Wallet, Printer, X, CheckCircle2, ChevronRight, Loader2, Layers } from 'lucide-react';

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

export default function KaryawanSlipPage() {
  const [employeeData, setEmployeeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Slip Modal State
  const [selectedSlip, setSelectedSlip] = useState<any>(null);
  const [isSlipOpen, setIsSlipOpen] = useState(false);
  const [loadingSlip, setLoadingSlip] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const fetchEmployeeData = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/karyawan/${id}`);
      if (res.ok) {
        const data = await res.json();
        setEmployeeData(data);
      } else {
        setError('Gagal memuat histori slip gaji.');
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
      fetchEmployeeData(session.id);
    } else {
      setError('Sesi Anda tidak valid. Silakan login kembali.');
      setLoading(false);
    }
  }, []);

  const handleViewSlip = async (slipId: string) => {
    setIsSlipOpen(true);
    setLoadingSlip(true);
    setSelectedSlip(null);
    try {
      const res = await fetch(`/api/penggajian/${slipId}`);
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

  const formatIDR = (num: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);

  return (
    <>
      <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(16,185,129,0.18) 0%, rgba(99,102,241,0.08) 60%, transparent 100%)',
          border: '1px solid rgba(16,185,129,0.18)',
          borderRadius: '16px',
          padding: '1.5rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 0.25rem', color: '#fff' }}>Slip Gaji Saya</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
              Daftar histori dan rincian slip gaji elektronik bulanan Anda
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Portal Kepegawaian</span>
            <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '0.78rem', color: 'var(--success)', fontWeight: 600 }}>Slip Gaji</span>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem', gap: '1rem', color: 'var(--text-secondary)' }}>
            <div style={{ width: '36px', height: '36px', border: '3px solid var(--border-light)', borderTopColor: 'var(--success)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            Memuat histori slip gaji...
          </div>
        ) : error ? (
          <div className="badge badge-error" style={{ padding: '1rem', width: '100%', fontSize: '1rem' }}>
            {error}
          </div>
        ) : (
          /* Slip Gaji Container */
          <div className="glass-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ width: '32px', height: '32px', background: 'rgba(16,185,129,0.12)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
                <Wallet size={16} />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Histori Slip Gaji Elektronik</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>Unduh atau cetak slip gaji yang telah disetujui HRD</p>
              </div>
            </div>

            {!employeeData?.penggajian || employeeData.penggajian.length === 0 ? (
              <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                Belum ada data slip gaji yang diterbitkan untuk akun Anda.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table" style={{ fontSize: '0.88rem' }}>
                  <thead>
                    <tr>
                      <th>Periode Pembayaran</th>
                      <th>Gaji Pokok</th>
                      <th>Total Tunjangan</th>
                      <th>Total Potongan</th>
                      <th>Gaji Bersih (THP)</th>
                      <th style={{ textAlign: 'center' }}>Status</th>
                      <th style={{ textAlign: 'right' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employeeData.penggajian.map((slip: any) => (
                      <tr key={slip.id} style={{ transition: 'all 0.2s' }}>
                        <td style={{ fontWeight: 600, color: '#fff' }}>
                          {BULAN_LIST.find(m => m.value === slip.bulan)?.label} {slip.tahun}
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{formatIDR(slip.gajiPokok)}</td>
                        <td style={{ color: 'var(--success)' }}>+{formatIDR(slip.totalTunjangan)}</td>
                        <td style={{ color: 'var(--error)' }}>-{formatIDR(slip.totalPotongan + slip.pajakPPh21)}</td>
                        <td style={{ fontWeight: 700, color: 'var(--success)' }}>{formatIDR(slip.gajiBersih)}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-block',
                            background: slip.statusPembayaran === 'LUNAS' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                            color: slip.statusPembayaran === 'LUNAS' ? 'var(--success)' : '#f59e0b',
                            border: slip.statusPembayaran === 'LUNAS' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(245, 158, 11, 0.2)',
                            padding: '3px 10px',
                            borderRadius: '20px',
                            fontSize: '0.72rem',
                            fontWeight: 700
                          }}>
                            {slip.statusPembayaran === 'LUNAS' ? 'LUNAS / PAID' : 'PENDING'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => handleViewSlip(slip.id)}
                            className="btn btn-primary"
                            style={{ padding: '0.45rem 1rem', fontSize: '0.78rem', borderRadius: '8px' }}
                          >
                            Rincian Slip
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL SLIP GAJI */}
      {isSlipOpen && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content" style={{ maxWidth: '850px', width: '95%', background: '#0a0d16' }}>
            <div className="modal-header no-print">
              <h2>Rincian Slip Gaji Digital</h2>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  onClick={() => {
                    window.print();
                    setToastMessage('🖨️ Mengirim perintah cetak slip...');
                    setTimeout(() => setToastMessage(''), 3000);
                  }} 
                  className="btn btn-primary" 
                  disabled={loadingSlip || !selectedSlip}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
                >
                  <Printer size={16} /><span>Cetak Slip</span>
                </button>
                <button onClick={() => setIsSlipOpen(false)} className="close-btn"><X size={20} /></button>
              </div>
            </div>
            <div className="modal-body" style={{ background: '#080b11', padding: '2rem', maxHeight: '80vh', overflowY: 'auto' }}>
              
              {loadingSlip ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', minHeight: '200px', gap: '1rem', color: 'var(--text-secondary)' }}>
                  <Loader2 className="animate-spin" size={32} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Memuat detail slip gaji...</span>
                </div>
              ) : selectedSlip ? (
                /* Slip Card Render */
                <div className="slip-gaji-card">
                  
                  {/* Header Kop */}
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

                  {/* Meta Grid */}
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

                  {/* Kehadiran Summary */}
                  <div style={{ fontSize: '0.85rem', marginBottom: '1.5rem', padding: '0.5rem', border: '1px dashed #cbd5e1', borderRadius: '4px', color: '#475569' }}>
                    <strong>Rincian Kehadiran:</strong> Hadir: {selectedSlip.kehadiran.hariHadir} hari | Sakit: {selectedSlip.kehadiran.hariSakit} hari | Cuti: {selectedSlip.kehadiran.hariCuti} hari | Absen (Alpha): {selectedSlip.kehadiran.hariAlpha} hari | Lembur: {selectedSlip.kehadiran.jamLembur || 0} jam
                  </div>

                  {/* Perincian Penerimaan & Potongan */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    
                    {/* Penerimaan */}
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
                      {(selectedSlip.gajiLembur || 0) > 0 && (
                        <div className="slip-item">
                          <span>Uang Lembur ({selectedSlip.kehadiran.jamLembur || 0} Jam)</span>
                          <span>{formatIDR(selectedSlip.gajiLembur)}</span>
                        </div>
                      )}
                      <div className="slip-total">
                        <span>Total Gaji Kotor</span>
                        <span>{formatIDR(selectedSlip.gajiPokok + selectedSlip.totalTunjangan + (selectedSlip.gajiLembur || 0))}</span>
                      </div>
                    </div>

                    {/* Potongan */}
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

                  {/* Gaji Bersih */}
                  <div className="slip-total" style={{ fontSize: '1.2rem', marginTop: '2rem', borderTop: '2px solid var(--primary)', paddingTop: '1rem', color: 'var(--success)' }}>
                    <span>GAJI BERSIH (Net Take Home Pay)</span>
                    <span>{formatIDR(selectedSlip.gajiBersih)}</span>
                  </div>

                  {/* Tanda Tangan */}
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

                  {/* Footer Slip */}
                  <div className="slip-gaji-footer">
                    <p>Terima kasih atas dedikasi dan kerja keras Anda.</p>
                    <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>Dokumen sah diterbitkan secara elektronik oleh Sistem Payroll Nappz Teknologi.</p>
                  </div>

                </div>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Gagal memuat rincian slip.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIF */}
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
