'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { ThemeProvider } from '@/components/ThemeProvider';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  const isPublicRoute = pathname === '/' || pathname === '/login' || pathname === '/login/admin' || pathname === '/login/karyawan';

  useEffect(() => {
    const checkAuth = async () => {
      await Promise.resolve();
      if (isPublicRoute) {
        setAuthorized(true);
        setLoading(false);
        return;
      }

      const adminSessionStr = localStorage.getItem('adminSession');
      const employeeSessionStr = localStorage.getItem('employeeSession');
      let adminSession = null;
      let employeeSession = null;
      try {
        if (adminSessionStr) {
          adminSession = JSON.parse(adminSessionStr);
        }
        if (employeeSessionStr) {
          employeeSession = JSON.parse(employeeSessionStr);
        }
      } catch (err) {
        console.error(err);
      }

      const isKaryawanRoute = pathname.startsWith('/karyawan-dashboard');

      if (isKaryawanRoute) {
        if (employeeSession && employeeSession.role === 'KARYAWAN') {
          setAuthorized(true);
        } else {
          setAuthorized(false);
          router.push('/login/karyawan');
        }
      } else {
        if (adminSession && adminSession.role === 'ADMIN') {
          setAuthorized(true);
        } else {
          const oldAdminActive = localStorage.getItem('adminActive');
          if (oldAdminActive === 'active') {
            setAuthorized(true);
          } else {
            setAuthorized(false);
            router.push('/login/admin');
          }
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [pathname, isPublicRoute, router]);

  if (loading) {
    return (
      <ThemeProvider>
        <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-app)', color: 'var(--text-secondary)' }}>
          Memverifikasi Akses Portal...
        </div>
      </ThemeProvider>
    );
  }

  if (isPublicRoute) {
    return <ThemeProvider>{children}</ThemeProvider>;
  }

  if (authorized) {
    return (
      <ThemeProvider>
        <div className="app-container">
          <Sidebar />
          <main className="main-content">
            {children}
          </main>
        </div>
      </ThemeProvider>
    );
  }

  return null;
}
