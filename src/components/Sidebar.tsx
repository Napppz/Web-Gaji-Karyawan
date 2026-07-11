/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, CalendarDays, Wallet, Layers, LogOut, ClipboardList, Settings, User, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [userSession, setUserSession] = useState<{ email: string; role: 'ADMIN' | 'KARYAWAN'; nama: string } | null>(null);

  useEffect(() => {
    const isKaryawanRoute = pathname.startsWith('/karyawan-dashboard');
    const sessionKey = isKaryawanRoute ? 'employeeSession' : 'adminSession';
    const sessionStr = localStorage.getItem(sessionKey);
    if (sessionStr) {
      try {
        setUserSession(JSON.parse(sessionStr));
      } catch (e) {
        console.error(e);
      }
    } else {
      setUserSession(null);
    }
  }, [pathname]);

  const isKaryawan = userSession?.role === 'KARYAWAN';

  const menuItems = isKaryawan
    ? [
      { name: 'Dashboard Saya', path: '/karyawan-dashboard', icon: LayoutDashboard },
      { name: 'Slip Gaji Saya', path: '/karyawan-dashboard/slip', icon: Wallet },
      { name: 'Profil Saya', path: '/karyawan-dashboard/profil', icon: User },
      { name: 'Sakit & Cuti', path: '/karyawan-dashboard/izin', icon: CalendarDays },
    ]
    : [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Karyawan', path: '/karyawan', icon: Users },
      { name: 'Kehadiran', path: '/kehadiran', icon: CalendarDays },
      { name: 'Persetujuan Izin', path: '/persetujuan', icon: ClipboardList },
      { name: 'Penggajian', path: '/penggajian', icon: Wallet },
      { name: 'Pengaturan', path: '/pengaturan', icon: Settings },
    ];

  const handleLogout = () => {
    const isKaryawanRoute = pathname.startsWith('/karyawan-dashboard');
    if (isKaryawanRoute) {
      localStorage.removeItem('employeeSession');
      window.location.href = '/login/karyawan';
    } else {
      localStorage.removeItem('adminSession');
      localStorage.removeItem('adminActive');
      window.location.href = '/login/admin';
    }
  };

  const name = userSession?.nama || 'Analis Program';
  const firstName = name.split(' ')[0];
  const roleText = isKaryawan ? 'Akses Karyawan' : 'Admin Mode';
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <aside className="sidebar no-print">
      <div className="sidebar-logo">
        <Layers className="text-primary" size={24} />
        <span>Hallo, {firstName}!</span>
      </div>

      <ul className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === '/dashboard' || item.path === '/karyawan-dashboard'
              ? pathname === item.path
              : pathname.startsWith(item.path);

          return (
            <li key={item.path}>
              <Link
                href={item.path}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div className="user-badge">
          <div className="avatar">{initials}</div>
          <div className="user-info-text">
            <h4>{name}</h4>
            <p>{roleText}</p>
          </div>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="no-print"
          title={theme === 'dark' ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
          style={{
            width: '100%',
            padding: '0.5rem',
            fontSize: '0.8rem',
            border: '1px solid var(--border-light)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            background: theme === 'dark' ? 'rgba(245,158,11,0.08)' : 'rgba(99,102,241,0.08)',
            color: theme === 'dark' ? '#f59e0b' : 'var(--primary)',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            fontWeight: 600,
            transition: 'all 0.25s ease',
          }}
        >
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          <span>{theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}</span>
        </button>

        <button
          onClick={handleLogout}
          className="btn btn-secondary no-print"
          style={{
            width: '100%',
            padding: '0.5rem',
            fontSize: '0.8rem',
            border: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444'
          }}
        >
          <LogOut size={14} />
          <span>Keluar Portal</span>
        </button>
      </div>
    </aside>
  );
}
