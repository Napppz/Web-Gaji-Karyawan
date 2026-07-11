'use client';

import Link from 'next/link';
import { Cpu, CheckCircle2, ShieldCheck, Zap, ArrowRight, Building2, MapPin, Mail, Phone, ExternalLink } from 'lucide-react';

export default function LandingPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 50% 0%, #0c1020 0%, #030712 100%)',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      
      {/* Decorative ambient background glows */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '10%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
        zIndex: 0,
        pointerEvents: 'none',
        filter: 'blur(90px)'
      }} />
      <div style={{
        position: 'absolute',
        top: '40%',
        right: '5%',
        width: '450px',
        height: '450px',
        background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)',
        zIndex: 0,
        pointerEvents: 'none',
        filter: 'blur(80px)'
      }} />

      {/* Header / Navigation Bar */}
      <header style={{
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
        padding: '1.75rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontWeight: 800, fontSize: '1.35rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, #818cf8 100%)',
            borderRadius: '10px',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(99,102,241,0.35)'
          }}>
            <Cpu size={18} style={{ color: '#fff' }} />
          </div>
          <span style={{
            background: 'linear-gradient(to right, #fff, #94a3b8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '0.5px'
          }}>
            Nappz<span style={{ color: 'var(--primary)', fontWeight: 900 }}> Teknologi</span>
          </span>
        </div>
        
        <nav style={{ display: 'flex', gap: '2.5rem', fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 500 }} className="nav-menu">
          <a href="#beranda" style={{ textDecoration: 'none', color: 'inherit', transition: 'var(--transition-smooth)' }} className="nav-hover-link">Beranda</a>
          <a href="#tentang" style={{ textDecoration: 'none', color: 'inherit', transition: 'var(--transition-smooth)' }} className="nav-hover-link">Tentang Kami</a>
          <a href="#layanan" style={{ textDecoration: 'none', color: 'inherit', transition: 'var(--transition-smooth)' }} className="nav-hover-link">Layanan IT</a>
          <a href="#kontak" style={{ textDecoration: 'none', color: 'inherit', transition: 'var(--transition-smooth)' }} className="nav-hover-link">Kontak</a>
        </nav>
        
        <Link href="/login" className="btn btn-primary" style={{ padding: '0.55rem 1.5rem', fontSize: '0.85rem', borderRadius: '30px', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <span>Portal Internal</span> <ExternalLink size={13} />
        </Link>
      </header>

      {/* Hero Section */}
      <section id="beranda" style={{
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
        padding: '6rem 2rem 4rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.75rem',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          padding: '0.45rem 1.15rem',
          borderRadius: '30px',
          background: 'rgba(99,102,241,0.08)',
          border: '1px solid rgba(99,102,241,0.25)',
          color: 'var(--primary)',
          fontSize: '0.78rem',
          fontWeight: 600,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          letterSpacing: '0.5px'
        }}>
          🏢 Profil Korporat Resmi PT Nappz Teknologi Nusantara
        </div>
        
        <h1 style={{
          fontSize: 'clamp(2.3rem, 5.5vw, 3.8rem)',
          fontWeight: 900,
          lineHeight: 1.15,
          letterSpacing: '-1.5px',
          maxWidth: '950px',
          margin: '0 auto',
          background: 'linear-gradient(to bottom, #ffffff 40%, #94a3b8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Rekayasa Teknologi Nusantara untuk Akselerasi Transformasi Digital
        </h1>
        
        <p style={{
          fontSize: 'clamp(1rem, 2.5vw, 1.12rem)',
          color: 'var(--text-secondary)',
          maxWidth: '750px',
          margin: '0 auto',
          lineHeight: 1.7,
          fontWeight: 400
        }}>
          Kami adalah mitra rekayasa perangkat lunak terpercaya yang berdedikasi membangun arsitektur digital korporasi yang tangguh, aman, dan inovatif. Membantu bisnis Anda melangkah melampaui batas efisiensi teknologi modern.
        </p>
        
        <div style={{ display: 'flex', gap: '1.25rem', marginTop: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <a href="#layanan" className="btn btn-primary" style={{ padding: '0.85rem 2.25rem', fontSize: '0.92rem', borderRadius: '30px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', boxShadow: '0 10px 20px -10px rgba(99,102,241,0.5)' }}>
            Eksplorasi Layanan Kami
          </a>
          <Link href="/login" className="btn btn-secondary" style={{ padding: '0.85rem 2.25rem', fontSize: '0.92rem', borderRadius: '30px', fontWeight: 700, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>Portal Karyawan & Admin</span> <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{
        maxWidth: '1000px',
        width: '100%',
        margin: '2rem auto 4rem',
        padding: '0 2rem',
        position: 'relative',
        zIndex: 10
      }}>
        <div className="glass-card" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem',
          padding: '2rem',
          background: 'rgba(15,23,42,0.4)',
          borderColor: 'rgba(255,255,255,0.05)',
          borderRadius: '16px',
          textAlign: 'center'
        }}>
          {[
            { value: '50+', label: 'Proyek IT Sukses', color: 'var(--primary)' },
            { value: '25+', label: 'Mitra Korporat Aktif', color: 'var(--success)' },
            { value: '15+', label: 'Ahli Rekayasa Perangkat Lunak', color: 'var(--info)' },
          ].map((stat, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Tentang Kami Section */}
      <section id="tentang" style={{
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
        padding: '5rem 2rem',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '4rem', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Tentang Kami</span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '0.35rem' }}>PT Nappz Teknologi Nusantara</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '1.25rem', lineHeight: 1.7, fontSize: '0.95rem' }}>
              Didirikan sebagai entitas software house dan konsultan IT terintegrasi, PT Nappz Teknologi Nusantara berkomitmen untuk menghadirkan ekosistem digital yang andal bagi korporasi dan institusi. Kami menjembatani ide bisnis Anda dengan produk teknologi mutakhir berskala global.
            </p>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.75rem', lineHeight: 1.7, fontSize: '0.95rem' }}>
              Fokus kami mencakup rekayasa aplikasi web/mobile tingkat lanjut, optimasi infrastruktur cloud serverless, integrasi database modern, serta penyederhanaan birokrasi operasional kantor melalui software HRIS/Payroll yang aman.
            </p>
          </div>
          
          <div className="glass-card" style={{ padding: '2.5rem', background: '#090c15', borderColor: 'rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '0.35rem' }}>Visi Perusahaan</div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                "Menjadi pionir akselerator solusi IT terpadu di Indonesia yang dikenal karena kode berkualitas dunia, integritas arsitektur data, dan komitmen pelayanan prima."
              </p>
            </div>
            
            <div style={{ borderTop: '1px dashed rgba(255,255,255,0.06)', paddingTop: '1.25rem' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '0.35rem' }}>Misi Utama</div>
              <ul style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: 0 }}>
                <li>Menghasilkan rekayasa kode yang bersih (*clean code*), aman, dan mudah dikembangkan.</li>
                <li>Menjamin perlindungan kerahasiaan data mitra bisnis secara komprehensif.</li>
                <li>Mendorong inovasi berkelanjutan dalam penyediaan solusi IT korporat.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Layanan IT / Services Grid */}
      <section id="layanan" style={{
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
        padding: '5rem 2rem',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ textAlign: 'center', marginBottom: '4.5rem' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Layanan IT Kami</span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '0.35rem' }}>Solusi Teknologi Profesional</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.95rem' }}>Layanan bernilai tinggi untuk mendukung efisiensi operasional dan produk digital.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem', padding: '2.25rem' }}>
            <div style={{ width: '48px', height: '48px', background: 'rgba(99,102,241,0.08)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.15)' }}>
              <Zap size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Software House & Web Development</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
              Pengembangan aplikasi web kustom dan perangkat lunak skala bisnis menggunakan kerangka kerja modern (React, Next.js, Node.js) demi performa kecepatan maksimal.
            </p>
          </div>

          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem', padding: '2.25rem' }}>
            <div style={{ width: '48px', height: '48px', background: 'rgba(16,185,129,0.08)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.15)' }}>
              <ShieldCheck size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Infrastruktur Cloud & Serverless</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
              Integrasi database serverless modern (seperti Neon PostgreSQL) dan hosting cloud otomatis (AWS, Vercel) untuk menjamin skalabilitas aplikasi tanpa batas downtime.
            </p>
          </div>

          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem', padding: '2.25rem' }}>
            <div style={{ width: '48px', height: '48px', background: 'rgba(14,165,233,0.08)', color: 'var(--info)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', border: '1px solid rgba(14,165,233,0.15)' }}>
              <Building2 size={20} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Konsultasi IT & Keamanan Sistem</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
              Audit keamanan sistem internal, optimasi basis data, integrasi REST API pihak ketiga, dan implementasi modul operasional HRIS serta kalkulator payroll berstandar regulasi nasional.
            </p>
          </div>

        </div>
      </section>





      {/* Kontak Section */}
      <section id="kontak" style={{
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
        padding: '5rem 2rem 6rem',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3.5rem' }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Kontak Resmi</span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '0.35rem' }}>Hubungi Perusahaan</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '1rem', lineHeight: 1.65, fontSize: '0.95rem' }}>
              Untuk keperluan bisnis, kemitraan strategis, audit keamanan siber, atau pertanyaan seputar rekayasa teknologi kami, hubungi tim korporat kami.
            </p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '40px', height: '40px', background: 'rgba(99,102,241,0.08)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <MapPin size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Alamat Head Office</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>Menara Teknologi Nusantara, Lt. 12, SCBD, Jakarta Selatan</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '40px', height: '40px', background: 'rgba(16,185,129,0.08)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
                <Mail size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Email Hubungan Korporat</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>corporate@nappz.co.id</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '40px', height: '40px', background: 'rgba(14,165,233,0.08)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--info)' }}>
                <Phone size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Telepon Kantor</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>+62 21 8080 9090</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        padding: '3.5rem 2rem',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        textAlign: 'center',
        fontSize: '0.82rem',
        color: 'var(--text-muted)',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.15rem', color: '#fff', marginBottom: '1rem' }}>
          <Cpu size={18} style={{ color: 'var(--primary)' }} />
          <span>PT Nappz Teknologi Nusantara</span>
        </div>
        <p style={{ margin: '0 0 0.5rem 0' }}>© 2026 PT Nappz Teknologi Nusantara. Seluruh Hak Cipta Dilindungi Undang-Undang.</p>

      </footer>

      {/* Styled JSX Hover Effects */}
      <style>{`
        .nav-hover-link:hover {
          color: #fff !important;
          text-shadow: 0 0 10px rgba(255,255,255,0.3);
        }
      `}</style>
    </div>
  );
}
