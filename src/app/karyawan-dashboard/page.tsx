/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from 'react';
import { Layers, CalendarDays, Wallet, User, CheckCircle2, Clock, Printer, X, Bell, Activity, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import Link from 'next/link';

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

export default function KaryawanDashboard() {
  const [userSession, setUserSession] = useState<any>(null);
  const [employeeData, setEmployeeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [time, setTime] = useState('');
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showWelcome, setShowWelcome] = useState(true);

  // Upgrade States
  const [clockInLogs, setClockInLogs] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [seenNotificationIds, setSeenNotificationIds] = useState<string[]>([]);
  const [jamMasukLimit, setJamMasukLimit] = useState('09:00');

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/pengaturan');
      if (res.ok) {
        const data = await res.json();
        if (data.JAM_MASUK) {
          setJamMasukLimit(data.JAM_MASUK);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLeaveHistory = async (karyawanId: string) => {
    try {
      const res = await fetch(`/api/pengajuan-izin?karyawanId=${karyawanId}`);
      if (res.ok) {
        const data = await res.json();
        const processed = data.filter((leave: any) => leave.status === 'DISETUJUI' || leave.status === 'DITOLAK');
        setNotifications(processed);
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
        await fetchSettings();
      } else { setError('Gagal memuat profil karyawan.'); }
    } catch (err) { console.error(err); setError('Terjadi kesalahan jaringan.'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const sessionStr = localStorage.getItem('employeeSession');
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      setUserSession(session);
      fetchEmployeeData(session.id);
    }
    // Auto-hide welcome banner after 4s
    const t = setTimeout(() => setShowWelcome(false), 4000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (userSession) {
      const today = new Date().toDateString();
      if (localStorage.getItem(`lastCheckIn_${userSession.id}`) === today) setIsClockedIn(true);
    }
  }, [userSession]);

  useEffect(() => {
    if (employeeData) {
      const seen = localStorage.getItem(`seenNotifications_${employeeData.id}`);
      if (seen) setSeenNotificationIds(JSON.parse(seen));
    }
  }, [employeeData]);

  const isLate = (hour: number, minute: number, limitStr: string) => {
    const [limitHour, limitMin] = limitStr.split(':').map(Number);
    if (hour > limitHour) return true;
    if (hour === limitHour && minute > limitMin) return true;
    return false;
  };

  useEffect(() => {
    if (employeeData) {
      const key = `clockInLogs_${employeeData.id}`;
      const logsStr = localStorage.getItem(key);
      if (logsStr) {
        setClockInLogs(JSON.parse(logsStr));
      } else {
        const generatedLogs = [];
        let datePointer = new Date();
        let daysToGenerate = activeAttendance.hariHadir;
        const [limitHour] = jamMasukLimit.split(':').map(Number);
        
        while (daysToGenerate > 0) {
          const dayOfWeek = datePointer.getDay();
          if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            const isToday = datePointer.toDateString() === new Date().toDateString();
            if (!isToday || isClockedIn) {
              const randMin = Math.floor(Math.random() * 60);
              const clockHour = randMin > 40 ? limitHour : limitHour - 1;
              const clockMin = randMin;
              
              generatedLogs.push({
                id: datePointer.getTime().toString() + daysToGenerate,
                tanggal: datePointer.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
                waktu: `${String(clockHour).padStart(2, '0')}:${String(clockMin).padStart(2, '0')}:00`,
                status: isLate(clockHour, clockMin, jamMasukLimit) ? 'TERLAMBAT' : 'TEPAT WAKTU',
              });
              daysToGenerate--;
            }
          }
          datePointer.setDate(datePointer.getDate() - 1);
        }
        setClockInLogs(generatedLogs);
        localStorage.setItem(key, JSON.stringify(generatedLogs));
      }
    }
  }, [employeeData, isClockedIn, jamMasukLimit]);

  const handleClockIn = async () => {
    if (!userSession) return;
    try {
      const res = await fetch('/api/kehadiran/absen-masuk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userSession.email }),
      });
      const result = await res.json();
      if (res.ok) {
        localStorage.setItem(`lastCheckIn_${userSession.id}`, new Date().toDateString());
        
        // Add clock-in daily log
        const today = new Date();
        const clockHour = today.getHours();
        const clockMin = today.getMinutes();
        const newLog = {
          id: today.getTime().toString(),
          tanggal: today.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
          waktu: today.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          status: isLate(clockHour, clockMin, jamMasukLimit) ? 'TERLAMBAT' : 'TEPAT WAKTU',
        };
        const updatedLogs = [newLog, ...clockInLogs];
        setClockInLogs(updatedLogs);
        localStorage.setItem(`clockInLogs_${userSession.id}`, JSON.stringify(updatedLogs));

        setIsClockedIn(true);
        setToastMessage('✅ Absensi masuk berhasil dicatat!');
        setTimeout(() => setToastMessage(''), 3500);
        fetchEmployeeData(userSession.id);
      } else { alert(result.error || 'Gagal melakukan absensi.'); }
    } catch (err) { console.error(err); alert('Terjadi kesalahan koneksi.'); }
  };

  const formatIDR = (num: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear  = new Date().getFullYear();
  const activeAttendance = employeeData?.kehadiran?.find(
    (k: any) => k.bulan === currentMonth && k.tahun === currentYear
  ) || { hariHadir: 0, hariSakit: 0, hariCuti: 0, hariAlpha: 0 };

  const firstName = (employeeData?.nama || userSession?.nama || '').split(' ')[0];

  const attendanceData = [
    { name: 'Hadir', value: activeAttendance.hariHadir, color: 'var(--success)' },
    { name: 'Sakit', value: activeAttendance.hariSakit, color: '#f59e0b' },
    { name: 'Cuti', value: activeAttendance.hariCuti, color: 'var(--primary)' },
    { name: 'Alpha', value: activeAttendance.hariAlpha, color: 'var(--error)' },
  ].filter(d => d.value > 0);

  // ─── WELCOME OVERLAY ──────────────────────────────────────────────────────
  if (showWelcome && !loading) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'radial-gradient(circle at 40% 30%, #1e1b4b 0%, #020617 70%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: '1.5rem', animation: 'fadeIn 0.5s ease',
      }}>
        <div style={{
          width: '80px', height: '80px',
          background: 'rgba(99,102,241,0.15)',
          border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: '22px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--primary)',
          boxShadow: '0 0 40px rgba(99,102,241,0.2)',
          animation: 'pulse 2s ease infinite',
        }}>
          <Layers size={40} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            {getGreetingEmoji()} {getGreeting()},
          </p>
          <h1 style={{
            fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', fontWeight: 800,
            background: 'linear-gradient(135deg, #fff 30%, var(--primary))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            margin: 0,
          }}>
            {employeeData?.nama || 'Karyawan'}!
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
            {employeeData?.jabatan} · {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => setShowWelcome(false)}
          style={{
            marginTop: '1rem', padding: '0.6rem 2rem', borderRadius: '30px',
            background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
            color: 'var(--primary)', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600,
          }}
        >
          Masuk Dashboard →
        </button>
        <style>{`
          @keyframes fadeIn { from { opacity:0; transform:scale(0.97); } to { opacity:1; transform:scale(1); } }
          @keyframes pulse { 0%,100% { box-shadow:0 0 30px rgba(99,102,241,0.2); } 50% { box-shadow:0 0 60px rgba(99,102,241,0.4); } }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* ── WELCOME HERO BANNER ───────────────────────────────────────── */}
        {!loading && !error && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(16,185,129,0.08) 60%, transparent 100%)',
            border: '1px solid rgba(99,102,241,0.18)',
            borderRadius: '16px',
            padding: '1.75rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              {/* Avatar */}
              <div style={{
                width: '56px', height: '56px',
                background: 'linear-gradient(135deg, var(--primary), #818cf8)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.4rem', fontWeight: 800, color: '#fff',
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
                  {employeeData?.jabatan} &nbsp;·&nbsp;
                  <span className={`badge ${employeeData?.statusKerja === 'TETAP' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.68rem', verticalAlign: 'middle' }}>
                    {employeeData?.statusKerja}
                  </span>
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', textAlign: 'right' }}>
              {/* Notification Bell */}
              <div style={{ position: 'relative' }}>
                <button 
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    if (!showNotifications && employeeData) {
                      const allIds = notifications.map(n => n.id);
                      setSeenNotificationIds(allIds);
                      localStorage.setItem(`seenNotifications_${employeeData.id}`, JSON.stringify(allIds));
                    }
                  }} 
                  style={{ 
                    background: 'rgba(255,255,255,0.03)', 
                    border: '1px solid rgba(255,255,255,0.08)', 
                    borderRadius: '50%', 
                    width: '40px', 
                    height: '40px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    color: notifications.filter(n => !seenNotificationIds.includes(n.id)).length > 0 ? 'var(--primary)' : 'var(--text-secondary)', 
                    cursor: 'pointer', 
                    position: 'relative', 
                    transition: 'all 0.3s' 
                  }}
                  title="Notifikasi Izin"
                >
                  <Bell size={18} />
                  {notifications.filter(n => !seenNotificationIds.includes(n.id)).length > 0 && (
                    <span style={{ 
                      position: 'absolute', 
                      top: '-2px', 
                      right: '-2px', 
                      background: 'var(--error)', 
                      color: '#fff', 
                      borderRadius: '50%', 
                      width: '18px', 
                      height: '18px', 
                      fontSize: '0.65rem', 
                      fontWeight: 'bold', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      border: '2px solid #080b11' 
                    }}>
                      {notifications.filter(n => !seenNotificationIds.includes(n.id)).length}
                    </span>
                  )}
                </button>
                {/* Dropdown Menu */}
                {showNotifications && (
                  <div style={{ 
                    position: 'absolute', 
                    top: '50px', 
                    right: 0, 
                    width: '320px', 
                    background: '#0f172a', 
                    border: '1px solid rgba(255,255,255,0.08)', 
                    borderRadius: '12px', 
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)', 
                    padding: '1rem', 
                    zIndex: 1000, 
                    textAlign: 'left' 
                  }}>
                    <h4 style={{ 
                      fontSize: '0.85rem', 
                      fontWeight: 700, 
                      marginBottom: '0.75rem', 
                      color: '#fff', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      borderBottom: '1px solid rgba(255,255,255,0.08)',
                      paddingBottom: '0.5rem'
                    }}>
                      <span>Notifikasi Pengajuan Izin</span>
                      <button onClick={() => setShowNotifications(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={14} /></button>
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '1rem 0', textAlign: 'center' }}>
                          Tidak ada notifikasi baru.
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: 'bold', color: n.status === 'DISETUJUI' ? 'var(--success)' : 'var(--error)' }}>
                                {n.status === 'DISETUJUI' ? '✅ Disetujui' : '❌ Ditolak'}
                              </span>
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{n.jenis}</span>
                            </div>
                            <div>Permohonan {n.jenis.toLowerCase()} ({n.tanggalMulai} s.d {n.tanggalSelesai}) telah {n.status.toLowerCase()} oleh Admin.</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Portal Kepegawaian</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700 }}>PT Nappz Teknologi</span>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem', gap: '1rem', color: 'var(--text-secondary)' }}>
            <div style={{ width: '36px', height: '36px', border: '3px solid var(--border-light)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            Memuat data karyawan...
          </div>
        ) : error ? (
          <div className="badge badge-error" style={{ padding: '1rem', width: '100%', fontSize: '1rem' }}>
            {error}
          </div>
        ) : (
          <>
            {/* ── 4 KPI STAT CARDS ─────────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
              {[
                { label: 'Hari Hadir', value: activeAttendance.hariHadir, color: 'var(--success)', bg: 'rgba(16,185,129,0.04)', border: 'rgba(16,185,129,0.15)', icon: CheckCircle2 },
                { label: 'Hari Sakit', value: activeAttendance.hariSakit, color: '#f59e0b', bg: 'rgba(245,158,11,0.04)', border: 'rgba(245,158,11,0.15)', icon: Activity },
                { label: 'Hari Cuti', value: activeAttendance.hariCuti, color: 'var(--primary)', bg: 'rgba(99,102,241,0.04)', border: 'rgba(99,102,241,0.15)', icon: CalendarDays },
                { label: 'Hari Alpha', value: activeAttendance.hariAlpha, color: 'var(--error)', bg: 'rgba(239,68,68,0.04)', border: 'rgba(239,68,68,0.15)', icon: AlertTriangle },
              ].map(({ label, value, color, bg, border, icon: Icon }) => (
                <div key={label} className="glass-card" style={{ padding: '1.25rem', background: bg, border: `1px solid ${border}`, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ color }}><Icon size={20} /></div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{label} — {BULAN_LIST[currentMonth - 1].label}</div>
                </div>
              ))}
            </div>

            {/* ── MAIN GRID: 2 COLUMNS (SEJAJAR & SAMA TINGGI) ────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', alignItems: 'stretch' }}>

              {/* Clock-In Card */}
              <div className="glass-card" style={{
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center', // Center vertically
                textAlign: 'center',
                gap: '1.25rem',
                height: '100%', // Stretch to full height of grid row
                background: isClockedIn
                  ? 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(15,23,42,0.4) 100%)'
                  : 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(15,23,42,0.4) 100%)',
                border: isClockedIn ? '1px solid rgba(16,185,129,0.18)' : '1px solid rgba(99,102,241,0.18)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isClockedIn ? 'var(--success)' : 'var(--primary)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  <Clock size={15} />
                  <span>Absensi Mandiri</span>
                </div>
                
                {/* Digital Clock display widget */}
                <div style={{ margin: '0.25rem 0' }}>
                  <div style={{
                    fontFamily: 'monospace',
                    fontSize: '2.5rem',
                    fontWeight: 900,
                    color: isClockedIn ? 'var(--success)' : '#fff',
                    letterSpacing: '2px',
                    textShadow: isClockedIn ? '0 0 15px rgba(16,185,129,0.35)' : '0 0 15px rgba(99,102,241,0.25)'
                  }}>
                    {time || '00:00:00'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>

                {isClockedIn ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', background: 'rgba(16,185,129,0.08)', padding: '0.65rem 1.75rem', borderRadius: '30px', fontWeight: 700, fontSize: '0.88rem', border: '1px solid rgba(16,185,129,0.15)' }}>
                    <CheckCircle2 size={16} />
                    Sudah Absen Masuk
                  </div>
                ) : (
                  <>
                    <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', margin: 0 }}>
                      Klik tombol di bawah untuk mencatat kehadiran Anda hari ini. Batas jam masuk kantor adalah jam yang ditetapkan admin.
                    </p>
                    <button onClick={handleClockIn} className="btn btn-primary" style={{ padding: '0.8rem 2.5rem', borderRadius: '30px', fontSize: '0.95rem', fontWeight: 700, boxShadow: '0 8px 20px -8px rgba(99,102,241,0.5)' }}>
                      Absen Masuk Sekarang
                    </button>
                  </>
                )}
              </div>

              {/* Grafik Absensi */}
              <div className="glass-card" style={{ padding: '1.75rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ width: '32px', height: '32px', background: 'rgba(99,102,241,0.12)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                    <CalendarDays size={16} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Visualisasi Kehadiran</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Rasio absensi bulan {BULAN_LIST[currentMonth - 1].label}</p>
                  </div>
                </div>
                {attendanceData.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    Belum ada catatan absensi terdaftar bulan ini.
                  </div>
                ) : (
                  <div style={{ height: '220px', width: '100%', flex: 1, display: 'flex', alignItems: 'center', marginTop: '0.5rem' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={attendanceData}
                          cx="50%"
                          cy="45%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {attendanceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff', fontSize: '0.8rem' }}
                          formatter={(value) => [`${value} Hari`, 'Durasi']}
                        />
                        <Legend 
                          verticalAlign="bottom"
                          height={36}
                          iconSize={10}
                          formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 500 }}>{value}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

            </div>

            {/* ── RIWAYAT ABSENSI HARIAN ── */}
            <div className="glass-card presensi-history-container" style={{ marginTop: '1.5rem', padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ width: '32px', height: '32px', background: 'rgba(16,185,129,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
                  <Clock size={16} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Riwayat Kehadiran Harian</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Log pencatatan masuk absensi mandiri</p>
                </div>
              </div>
              {clockInLogs.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Belum ada riwayat masuk tercatat.
                </div>
              ) : (
                <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  <table className="table" style={{ fontSize: '0.83rem' }}>
                    <thead>
                      <tr>
                        <th>Hari / Tanggal</th>
                        <th>Waktu Absen</th>
                        <th style={{ textAlign: 'right' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clockInLogs.map((log) => (
                        <tr key={log.id}>
                          <td style={{ fontWeight: 600 }}>{log.tanggal}</td>
                          <td style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>⏱️ {log.waktu}</td>
                          <td style={{ textAlign: 'right' }}>
                            <span style={{ 
                              display: 'inline-block', 
                              background: log.status === 'TEPAT WAKTU' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', 
                              color: log.status === 'TEPAT WAKTU' ? 'var(--success)' : '#f59e0b',
                              border: log.status === 'TEPAT WAKTU' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(245, 158, 11, 0.2)',
                              padding: '2px 8px', 
                              borderRadius: '5px', 
                              fontSize: '0.7rem', 
                              fontWeight: 700 
                            }}>
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

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
