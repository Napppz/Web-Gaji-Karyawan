/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Users, Briefcase, DollarSign, Wallet, ArrowRight, CheckCircle2, Percent, TrendingUp, Clock, RefreshCw, UserCheck, UserX, AlertTriangle, CalendarDays } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AttendanceRow {
  id: string;
  nama: string;
  jabatan: string;
  statusKerja: string;
  hariHadir: number;
  hariSakit: number;
  hariCuti: number;
  hariAlpha: number;
}

interface DashboardData {
  totalKaryawan: number;
  permanentCount: number;
  contractCount: number;
  totalSalaryExpense: number;
  paidPayments: number;
  pendingPayments: number;
  averageSalary: number;
  totalTaxCollected: number;
  departmentDistribution: { name: string; value: number }[];
  monthlyExpenseTrend: { month: string; expense: number }[];
  recentEmployees: { id: string; nama: string; jabatan: string; statusKerja: string }[];
  recentPayrolls: { id: string; karyawan: { nama: string; jabatan: string }; gajiBersih: number; statusPembayaran: string }[];
  attendanceSummary: AttendanceRow[];
  totalHariHadir: number;
  totalHariSakit: number;
  totalHariCuti: number;
  totalHariAlpha: number;
  attendanceBulan: number;
  attendanceTahun: number;
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#0ea5e9', '#ec4899', '#8b5cf6'];

const BULAN_NAMES = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [time, setTime] = useState('');
  const [lastRefresh, setLastRefresh] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [searchAttend, setSearchAttend] = useState('');

  const fetchData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch('/api/dashboard');
      if (res.ok) {
        const result = await res.json();
        setData(result);
        setLastRefresh(new Date().toLocaleTimeString('id-ID'));
      } else {
        setError('Gagal memuat ringkasan dashboard.');
      }
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan koneksi.');
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await Promise.resolve();
      setIsMounted(true);
      fetchData();
    };
    init();
  }, [fetchData]);

  // Realtime clock
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => fetchData(), 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const formatIDR = (num: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '80vh', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-light)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        Sedang memuat analisis dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card" style={{ margin: '2rem auto', maxWidth: '600px', textAlign: 'center', color: 'var(--error)', padding: '2rem' }}>
        <h3>Gagal Memuat Dashboard</h3>
        <p>{error}</p>
      </div>
    );
  }

  const filteredAttend = (data?.attendanceSummary || []).filter(row =>
    row.nama.toLowerCase().includes(searchAttend.toLowerCase()) ||
    row.jabatan.toLowerCase().includes(searchAttend.toLowerCase())
  );

  return (
    <>
      <div className="page-header">
        <div className="page-title">
          <h1>Dashboard Analitik Utama</h1>
          <p>Rekapitulasi penggajian & kehadiran karyawan periode <strong>{BULAN_NAMES[(data?.attendanceBulan ?? new Date().getMonth() + 1) - 1]} {data?.attendanceTahun ?? new Date().getFullYear()}</strong>.</p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <div className="glass-card kpi-card">
          <div className="kpi-details">
            <span>Total Karyawan</span>
            <h3>{data?.totalKaryawan || 0} orang</h3>
          </div>
          <div className="kpi-icon primary">
            <Users size={24} />
          </div>
        </div>

        <div className="glass-card kpi-card">
          <div className="kpi-details">
            <span>Total Gaji Bersih</span>
            <h3>{formatIDR(data?.totalSalaryExpense || 0)}</h3>
          </div>
          <div className="kpi-icon success">
            <DollarSign size={24} />
          </div>
        </div>

        <div className="glass-card kpi-card">
          <div className="kpi-details">
            <span>Rata-rata Gaji Bersih</span>
            <h3>{formatIDR(data?.averageSalary || 0)}</h3>
          </div>
          <div className="kpi-icon success" style={{ background: 'rgba(16, 185, 129, 0.08)', color: 'var(--success)' }}>
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="glass-card kpi-card">
          <div className="kpi-details">
            <span>Transfer Lunas</span>
            <h3>{data?.paidPayments || 0} karyawan</h3>
          </div>
          <div className="kpi-icon primary">
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="glass-card kpi-card">
          <div className="kpi-details">
            <span>Transfer Tertunda</span>
            <h3>{data?.pendingPayments || 0} karyawan</h3>
          </div>
          <div className="kpi-icon warning">
            <Wallet size={24} />
          </div>
        </div>

        <div className="glass-card kpi-card">
          <div className="kpi-details">
            <span>Total Pajak Terkumpul (PPh 21)</span>
            <h3>{formatIDR(data?.totalTaxCollected || 0)}</h3>
          </div>
          <div className="kpi-icon warning" style={{ background: 'rgba(245, 158, 11, 0.08)', color: 'var(--warning)' }}>
            <Percent size={24} />
          </div>
        </div>
      </div>

      {/* ===== KEHADIRAN REALTIME ===== */}
      <div className="glass-card" style={{ borderColor: 'rgba(99,102,241,0.15)' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CalendarDays size={20} style={{ color: 'var(--primary)' }} />
              Rekap Kehadiran Realtime — Bulan Ini
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
              Data langsung dari database. Terakhir diperbarui: <strong>{lastRefresh}</strong>
              &nbsp;·&nbsp;
              <span style={{ color: 'var(--success)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{time}</span>
            </p>
          </div>
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.5rem 1rem', borderRadius: '8px',
              background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
              color: 'var(--primary)', fontSize: '0.83rem', fontWeight: 600,
              cursor: refreshing ? 'not-allowed' : 'pointer', opacity: refreshing ? 0.6 : 1,
              transition: 'all 0.2s',
            }}
          >
            <RefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            {refreshing ? 'Memperbarui...' : 'Refresh Data'}
          </button>
        </div>

        {/* KPI Kehadiran */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Total Hari Hadir', value: data?.totalHariHadir ?? 0, icon: <UserCheck size={20} />, color: 'var(--success)', bg: 'rgba(16,185,129,0.08)' },
            { label: 'Total Hari Sakit', value: data?.totalHariSakit ?? 0, icon: <Briefcase size={20} />, color: '#0ea5e9', bg: 'rgba(14,165,233,0.08)' },
            { label: 'Total Hari Cuti', value: data?.totalHariCuti ?? 0, icon: <Clock size={20} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
            { label: 'Total Hari Alpha', value: data?.totalHariAlpha ?? 0, icon: <UserX size={20} />, color: 'var(--error)', bg: 'rgba(239,68,68,0.08)' },
          ].map(({ label, value, icon, color, bg }) => (
            <div key={label} style={{
              padding: '1rem 1.25rem',
              background: bg,
              border: `1px solid ${color}30`,
              borderRadius: '10px',
              display: 'flex', flexDirection: 'column', gap: '0.35rem',
            }}>
              <div style={{ color, display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600 }}>
                {icon} {label}
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color, lineHeight: 1 }}>
                {value} <span style={{ fontSize: '0.8rem', fontWeight: 500, opacity: 0.7 }}>hari</span>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ marginBottom: '1rem', position: 'relative' }}>
          <input
            type="text"
            placeholder="Cari nama atau jabatan karyawan..."
            className="form-input"
            style={{ paddingLeft: '1rem', fontSize: '0.85rem' }}
            value={searchAttend}
            onChange={e => setSearchAttend(e.target.value)}
          />
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Karyawan</th>
                <th>Jabatan</th>
                <th>Status</th>
                <th style={{ textAlign: 'center', color: 'var(--success)' }}>Hadir</th>
                <th style={{ textAlign: 'center', color: '#0ea5e9' }}>Sakit</th>
                <th style={{ textAlign: 'center', color: '#f59e0b' }}>Cuti</th>
                <th style={{ textAlign: 'center', color: 'var(--error)' }}>Alpha</th>
                <th style={{ textAlign: 'center' }}>Kehadiran %</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttend.length > 0 ? filteredAttend.map((row) => {
                const total = row.hariHadir + row.hariSakit + row.hariCuti + row.hariAlpha;
                const pct = total > 0 ? Math.round((row.hariHadir / total) * 100) : 0;
                return (
                  <tr key={row.id}>
                    <td style={{ fontWeight: 600 }}>{row.nama}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{row.jabatan}</td>
                    <td>
                      <span className={`badge ${row.statusKerja === 'TETAP' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.7rem' }}>
                        {row.statusKerja === 'TETAP' ? 'Tetap' : 'Kontrak'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--success)' }}>{row.hariHadir}</td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: '#0ea5e9' }}>{row.hariSakit}</td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: '#f59e0b' }}>{row.hariCuti}</td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: row.hariAlpha > 0 ? 'var(--error)' : 'var(--text-secondary)' }}>
                      {row.hariAlpha > 0 && <AlertTriangle size={13} style={{ marginRight: '3px', verticalAlign: 'middle' }} />}
                      {row.hariAlpha}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: pct >= 90 ? 'var(--success)' : pct >= 70 ? '#f59e0b' : 'var(--error)' }}>
                          {pct}%
                        </span>
                        <div style={{ width: '64px', height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', borderRadius: '99px',
                            width: `${pct}%`,
                            background: pct >= 90 ? 'var(--success)' : pct >= 70 ? '#f59e0b' : 'var(--error)',
                            transition: 'width 0.6s ease',
                          }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    {searchAttend ? 'Tidak ada karyawan yang sesuai pencarian.' : 'Belum ada data kehadiran bulan ini.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '1rem', textAlign: 'right' }}>
          <Link href="/kehadiran" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
            fontSize: '0.83rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600,
          }}>
            Kelola Absensi Lengkap <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Charts section */}
      {isMounted && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {/* Monthly expense trend */}
          <div className="glass-card">
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 600 }}>Tren Pengeluaran Gaji Bersih Bulanan (6 Bulan Terakhir)</h3>
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.monthlyExpenseTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                  <XAxis dataKey="month" stroke="var(--text-secondary)" fontSize={12} />
                  <YAxis stroke="var(--text-secondary)" fontSize={11} tickFormatter={(v) => `Rp ${v / 1e6}Jt`} />
                  <Tooltip
                    contentStyle={{ background: '#0f172a', borderColor: 'var(--border-light)', borderRadius: '8px' }}
                    labelStyle={{ fontWeight: 'bold', color: '#fff' }}
                    formatter={(value: any) => [formatIDR(value), 'Total Gaji Bersih']}
                  />
                  <Line type="monotone" dataKey="expense" stroke="var(--primary)" strokeWidth={3} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Department distribution */}
          <div className="glass-card">
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 600 }}>Penyebaran Jabatan SDM</h3>
            <div style={{ width: '100%', height: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {data?.departmentDistribution && data.departmentDistribution.length > 0 ? (
                <div style={{ display: 'flex', height: '100%' }}>
                  <div style={{ flex: 1 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={data.departmentDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                          {data.departmentDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#0f172a', borderColor: 'var(--border-light)', borderRadius: '8px' }} formatter={(value) => [`${value} Karyawan`]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                    {data.departmentDistribution.map((entry, index) => (
                      <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: COLORS[index % COLORS.length] }} />
                        <span style={{ fontWeight: 500 }}>{entry.name} ({entry.value})</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>Belum ada pembagian jabatan.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Aktivitas Terbaru */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-card">
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 600 }}>Karyawan Baru Terdaftar</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data?.recentEmployees && data.recentEmployees.length > 0 ? (
              data.recentEmployees.map((kar) => (
                <div key={kar.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.01)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{kar.nama}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{kar.jabatan}</div>
                  </div>
                  <span className={`badge ${kar.statusKerja === 'TETAP' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.7rem' }}>
                    {kar.statusKerja === 'TETAP' ? 'Tetap' : 'Kontrak'}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ padding: '1rem', color: 'var(--text-secondary)', textAlign: 'center', fontSize: '0.85rem' }}>Belum ada data karyawan terdaftar.</div>
            )}
          </div>
        </div>

        <div className="glass-card">
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 600 }}>Kalkulasi Slip Gaji Terkini</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data?.recentPayrolls && data.recentPayrolls.length > 0 ? (
              data.recentPayrolls.map((pay) => (
                <div key={pay.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.01)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{pay.karyawan.nama}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '0.15rem', fontWeight: 500 }}>{formatIDR(pay.gajiBersih)}</div>
                  </div>
                  <span className={`badge ${pay.statusPembayaran === 'LUNAS' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.7rem' }}>
                    {pay.statusPembayaran === 'LUNAS' ? 'Lunas' : 'Tertunda'}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ padding: '1rem', color: 'var(--text-secondary)', textAlign: 'center', fontSize: '0.85rem' }}>Belum ada kalkulasi gaji diproses.</div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card">
        <h3 style={{ marginBottom: '1.25rem', fontSize: '1.1rem', fontWeight: 600 }}>Akses Cepat Modul Sistem</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <Link href="/karyawan" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Users className="text-primary" size={20} />
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Data Karyawan</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Profil, jabatan, & rekening transfer</p>
                </div>
              </div>
              <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
            </div>
          </Link>

          <Link href="/kehadiran" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Briefcase className="text-primary" size={20} />
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Absensi Bulanan</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Log kehadiran, cuti, sakit, & alpha</p>
                </div>
              </div>
              <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
            </div>
          </Link>

          <Link href="/penggajian" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Wallet className="text-primary" size={20} />
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Hitung & Proses Gaji</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>PPh 21, BPJS, & cetak slip gaji</p>
                </div>
              </div>
              <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
            </div>
          </Link>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
