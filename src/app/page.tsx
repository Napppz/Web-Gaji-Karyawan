'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import {
  Cpu, ShieldCheck, Zap, ArrowRight,
  MapPin, Mail, Phone, ExternalLink, Code2, Database,
  Users, Award, TrendingUp, ChevronRight, Menu, X,
  Lock, Rocket, Star
} from 'lucide-react';



// --- Animated Counter Hook ---
function useCounter(target: number, duration: number = 2000, start: boolean = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

// --- Particle Background ---
function ParticleBackground() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {/* Grid lines */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }} />
      {/* Animated orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      {/* Floating dots */}
      {[...Array(12)].map((_, i) => (
        <div key={i} className={`floating-dot dot-${i}`} style={{
          position: 'absolute',
          width: i % 3 === 0 ? '4px' : '2px',
          height: i % 3 === 0 ? '4px' : '2px',
          borderRadius: '50%',
          background: i % 2 === 0 ? 'rgba(99,102,241,0.6)' : 'rgba(16,185,129,0.6)',
          left: `${(i * 8.33) % 100}%`,
          top: `${(i * 13.5 + 10) % 100}%`,
          animation: `floatDot ${4 + (i % 4)}s ease-in-out infinite`,
          animationDelay: `${i * 0.5}s`,
        }} />
      ))}
    </div>
  );
}


// --- Stat Card ---
function StatCard({ value, suffix, label, color, icon: Icon, animStart }: {
  value: number, suffix: string, label: string, color: string, icon: React.ElementType, animStart: boolean
}) {
  const count = useCounter(value, 2000, animStart);
  return (
    <div className="stat-item">
      <div className="stat-icon" style={{ background: `${color}18`, color }}>
        <Icon size={20} />
      </div>
      <div className="stat-num" style={{ color }}>{count}{suffix}</div>
      <div className="stat-label-text">{label}</div>
    </div>
  );
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const services = [
    {
      icon: Code2, color: '#6366f1', bg: 'rgba(99,102,241,0.08)',
      title: 'Software House & Web Development',
      desc: 'Pengembangan aplikasi web & mobile kustom menggunakan React, Next.js, dan Node.js untuk performa maksimal dan user experience terbaik.',
      tags: ['React', 'Next.js', 'TypeScript'],
    },
    {
      icon: Database, color: '#10b981', bg: 'rgba(16,185,129,0.08)',
      title: 'Infrastruktur Cloud & Database',
      desc: 'Integrasi database serverless modern (Neon, Supabase) dan hosting cloud (AWS, Vercel) untuk skalabilitas tanpa downtime.',
      tags: ['AWS', 'Vercel', 'PostgreSQL'],
    },
    {
      icon: ShieldCheck, color: '#0ea5e9', bg: 'rgba(14,165,233,0.08)',
      title: 'Keamanan Sistem & Audit IT',
      desc: 'Audit keamanan sistem internal, penetration testing, dan implementasi protokol keamanan siber standar enterprise.',
      tags: ['Security', 'Audit', 'Compliance'],
    },
  ];



  return (
    <div className="landing-root">
      <ParticleBackground />

      {/* ── NAVBAR ── */}
      <header className={`landing-nav ${scrolled ? 'nav-scrolled' : ''}`}>
        <div className="nav-inner">
          {/* Logo */}
          <div className="nav-logo">
            <div className="logo-icon">
              <Cpu size={18} color="#fff" />
            </div>
            <span className="logo-text">
              Nappz<span className="logo-accent"> Teknologi</span>
            </span>
          </div>

          {/* Desktop Links */}
          <nav className="nav-links">
            {['Beranda', 'Tentang', 'Layanan', 'Kontak'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="nav-link">
                {item}
              </a>
            ))}
          </nav>

          <div className="nav-actions">
            <Link href="/login" className="btn-nav-cta">
              Portal Internal <ExternalLink size={13} />
            </Link>
            <button className="nav-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="mobile-menu">
            {['Beranda', 'Tentang', 'Layanan', 'Kontak'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="mobile-link" onClick={() => setMenuOpen(false)}>
                <ChevronRight size={14} /> {item}
              </a>
            ))}
            <Link href="/login" className="mobile-cta" onClick={() => setMenuOpen(false)}>
              Portal Internal
            </Link>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section id="beranda" className="hero-section">
        {/* Floating badge */}
        <div className="hero-badge">
          <span className="badge-dot" />
          🏢 Profil Resmi · PT Nappz Teknologi Nusantara
        </div>

        <h1 className="hero-title">
          Rekayasa Teknologi<br />
          <span className="hero-title-gradient">Nusantara</span> untuk<br />
          Akselerasi Digital
        </h1>

        <p className="hero-desc">
          Mitra rekayasa perangkat lunak terpercaya untuk membangun arsitektur digital korporasi
          yang tangguh, aman, dan inovatif. Bersama kami, bisnis Anda melangkah melampaui batas
          efisiensi teknologi modern.
        </p>

        <div className="hero-actions">
          <a href="#layanan" className="btn-hero-primary">
            <Rocket size={16} /> Eksplorasi Layanan
          </a>
          <Link href="/login" className="btn-hero-secondary">
            Portal Karyawan & Admin <ArrowRight size={15} />
          </Link>
        </div>

        {/* Hero visual card */}
        <div className="hero-card-float">
          <div className="hcard-header">
            <div className="hcard-dot red" /><div className="hcard-dot yellow" /><div className="hcard-dot green" />
            <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>nappz-system.ts</span>
          </div>
          <div className="hcard-code">
            <span className="c-kw">const</span> <span className="c-var">nappz</span> = {'{'}
            <br />{'  '}<span className="c-key">name</span>: <span className="c-str">"PT Nappz Teknologi Nusantara"</span>,
            <br />{'  '}<span className="c-key">mission</span>: <span className="c-str">"Akselerasi Transformasi Digital"</span>,
            <br />{'  '}<span className="c-key">solutions</span>: [<span className="c-str">"HRIS"</span>, <span className="c-str">"Cloud"</span>, <span className="c-str">"Security"</span>],
            <br />{'  '}<span className="c-key">status</span>: <span className="c-bool">true</span> <span className="c-comment">// Siap melayani</span>
            <br />{'}'}
          </div>
          <div className="hcard-footer">
            <span className="c-success">✓ Build successful</span>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem' }}>3 services running</span>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="stats-section" ref={statsRef}>
        <div className="stats-grid">
          <StatCard value={50} suffix="+" label="Proyek IT Sukses" color="#6366f1" icon={Award} animStart={statsVisible} />
          <StatCard value={25} suffix="+" label="Mitra Korporat Aktif" color="#10b981" icon={Users} animStart={statsVisible} />
          <StatCard value={15} suffix="+" label="Ahli Software Engineer" color="#0ea5e9" icon={Code2} animStart={statsVisible} />
          <StatCard value={99} suffix="%" label="Uptime SLA Garansi" color="#f59e0b" icon={TrendingUp} animStart={statsVisible} />
        </div>
      </section>

      {/* ── TENTANG ── */}
      <section id="tentang" className="about-section">
        <div className="section-divider" />
        <div className="about-grid">
          {/* Left: Text */}
          <div className="about-text">
            <span className="section-tag">Tentang Kami</span>
            <h2 className="section-title">PT Nappz Teknologi<br />Nusantara</h2>
            <p className="section-desc">
              Didirikan sebagai entitas <strong>software house dan konsultan IT terintegrasi</strong>, 
              PT Nappz Teknologi Nusantara berkomitmen menghadirkan ekosistem digital yang andal 
              bagi korporasi dan institusi di seluruh Indonesia.
            </p>
            <p className="section-desc">
              Fokus kami mencakup rekayasa aplikasi web/mobile tingkat lanjut, optimasi infrastruktur 
              cloud serverless, serta penyederhanaan birokrasi operasional melalui software HRIS/Payroll yang aman.
            </p>
            <div className="about-pills">
              {['Clean Code', 'Agile Development', 'ISO 27001 Security', 'Open Source'].map((tag) => (
                <span key={tag} className="about-pill">{tag}</span>
              ))}
            </div>
          </div>

          {/* Right: Vision/Mission Card */}
          <div className="about-cards">
            <div className="visi-card">
              <div className="visi-icon"><Star size={16} /></div>
              <div>
                <div className="visi-label">Visi Perusahaan</div>
                <p className="visi-text">
                  "Menjadi pionir akselerator solusi IT terpadu di Indonesia yang dikenal karena 
                  kode berkualitas dunia, integritas arsitektur data, dan komitmen pelayanan prima."
                </p>
              </div>
            </div>

            <div className="misi-card">
              <div className="misi-label">Misi Utama</div>
              <ul className="misi-list">
                {[
                  { icon: Code2, text: 'Menghasilkan rekayasa kode yang bersih, aman, dan mudah dikembangkan.' },
                  { icon: Lock, text: 'Menjamin perlindungan kerahasiaan data mitra bisnis secara komprehensif.' },
                  { icon: Rocket, text: 'Mendorong inovasi berkelanjutan dalam solusi IT korporat.' },
                ].map(({ icon: Icon, text }, i) => (
                  <li key={i} className="misi-item">
                    <Icon size={14} color="#6366f1" style={{ flexShrink: 0 }} />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── LAYANAN ── */}
      <section id="layanan" className="services-section">
        <div className="section-divider" />
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <span className="section-tag">Layanan IT Kami</span>
          <h2 className="section-title" style={{ maxWidth: '600px', margin: '0.5rem auto 0' }}>
            Solusi Teknologi Profesional
          </h2>
          <p className="section-desc" style={{ maxWidth: '550px', margin: '0.5rem auto 0' }}>
            Layanan bernilai tinggi untuk mendukung efisiensi operasional dan produk digital perusahaan Anda.
          </p>
        </div>

        <div className="services-grid">
          {services.map((svc, i) => (
            <div key={i} className="service-card" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="svc-icon" style={{ background: svc.bg, color: svc.color }}>
                <svc.icon size={22} />
              </div>
              <h3 className="svc-title">{svc.title}</h3>
              <p className="svc-desc">{svc.desc}</p>
              <div className="svc-tags">
                {svc.tags.map((tag) => (
                  <span key={tag} className="svc-tag" style={{ color: svc.color, borderColor: `${svc.color}30`, background: `${svc.color}0a` }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>



      {/* ── KONTAK ── */}
      <section id="kontak" className="contact-section">
        <div className="section-divider" />
        <div className="contact-grid">
          <div>
            <span className="section-tag">Kontak Resmi</span>
            <h2 className="section-title">Hubungi Perusahaan</h2>
            <p className="section-desc">
              Untuk keperluan bisnis, kemitraan strategis, atau pertanyaan seputar layanan kami,
              hubungi tim korporat PT Nappz Teknologi Nusantara.
            </p>
            <div className="contact-cta-box">
              <Zap size={18} color="#6366f1" />
              <span>Respons dalam <strong>24 jam</strong> pada hari kerja</span>
            </div>
          </div>

          <div className="contact-info">
            {[
              { icon: MapPin, color: '#6366f1', label: 'Alamat Head Office', value: 'Menara Teknologi Nusantara, Lt. 12, SCBD, Jakarta Selatan' },
              { icon: Mail, color: '#10b981', label: 'Email Korporat', value: 'corporate@nappz.co.id' },
              { icon: Phone, color: '#0ea5e9', label: 'Telepon Kantor', value: '+62 21 8080 9090' },
            ].map(({ icon: Icon, color, label, value }, i) => (
              <div key={i} className="contact-item">
                <div className="contact-icon" style={{ background: `${color}15`, color }}>
                  <Icon size={18} />
                </div>
                <div>
                  <div className="contact-label">{label}</div>
                  <div className="contact-value">{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* ── FOOTER ── */}
      <footer className="landing-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
              <div className="logo-icon"><Cpu size={16} color="#fff" /></div>
              <span className="logo-text" style={{ fontSize: '1.1rem' }}>
                Nappz<span className="logo-accent"> Teknologi</span>
              </span>
            </div>
            <p className="footer-tagline">Rekayasa Teknologi Nusantara untuk Akselerasi Transformasi Digital.</p>
          </div>
          <div className="footer-links-col">
            <div className="footer-col-title">Navigasi</div>
            {['Beranda', 'Tentang Kami', 'Layanan IT', 'Klien', 'Kontak'].map(link => (
              <a key={link} href={`#${link.toLowerCase().replace(/ /g, '')}`} className="footer-link">{link}</a>
            ))}
          </div>
          <div className="footer-links-col">
            <div className="footer-col-title">Portal</div>
            <Link href="/login" className="footer-link">Login Admin</Link>
            <Link href="/login/karyawan" className="footer-link">Login Karyawan</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 PT Nappz Teknologi Nusantara. Seluruh Hak Cipta Dilindungi.</span>
          <span style={{ color: 'var(--text-muted)' }}>Made with ❤️ in Indonesia</span>
        </div>
      </footer>

      {/* ── GLOBAL STYLES ── */}
      <style>{`
        /* Root */
        .landing-root {
          min-height: 100vh;
          background: #03050d;
          color: #fff;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow-x: hidden;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        /* Orbs */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
        }
        .orb-1 {
          width: 600px; height: 600px;
          top: -100px; left: -100px;
          background: radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 70%);
          animation: orbFloat 8s ease-in-out infinite;
        }
        .orb-2 {
          width: 500px; height: 500px;
          top: 30%; right: -80px;
          background: radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%);
          animation: orbFloat 10s ease-in-out infinite reverse;
        }
        .orb-3 {
          width: 400px; height: 400px;
          bottom: 10%; left: 20%;
          background: radial-gradient(circle, rgba(168,85,247,0.07) 0%, transparent 70%);
          animation: orbFloat 12s ease-in-out infinite 2s;
        }
        @keyframes orbFloat {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }
        @keyframes floatDot {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.6; }
          50% { transform: translateY(-15px) scale(1.2); opacity: 1; }
        }

        /* ── NAVBAR ── */
        .landing-nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          transition: all 0.4s cubic-bezier(0.4,0,0.2,1);
          padding: 0;
        }
        .nav-scrolled {
          background: rgba(3,5,13,0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(99,102,241,0.1);
          box-shadow: 0 4px 30px rgba(0,0,0,0.3);
        }
        .nav-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 1.4rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
        }
        .nav-logo {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          text-decoration: none;
        }
        .logo-icon {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 20px rgba(99,102,241,0.4);
          flex-shrink: 0;
        }
        .logo-text {
          font-weight: 800;
          font-size: 1.25rem;
          background: linear-gradient(to right, #fff, #94a3b8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .logo-accent {
          color: #6366f1;
          -webkit-text-fill-color: #6366f1;
        }
        .nav-links {
          display: flex;
          gap: 2rem;
        }
        .nav-link {
          font-size: 0.875rem;
          font-weight: 500;
          color: rgba(255,255,255,0.55);
          text-decoration: none;
          transition: all 0.25s ease;
          position: relative;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px; left: 0; right: 0;
          height: 1.5px;
          background: #6366f1;
          border-radius: 2px;
          transform: scaleX(0);
          transition: transform 0.25s ease;
        }
        .nav-link:hover {
          color: #fff;
        }
        .nav-link:hover::after {
          transform: scaleX(1);
        }
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .btn-nav-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.55rem 1.35rem;
          background: linear-gradient(135deg, #6366f1, #818cf8);
          color: #fff;
          border-radius: 30px;
          font-size: 0.82rem;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(99,102,241,0.3);
        }
        .btn-nav-cta:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 25px rgba(99,102,241,0.45);
        }
        .nav-hamburger {
          display: none;
          background: none;
          border: none;
          color: #fff;
          cursor: pointer;
          padding: 0.25rem;
        }
        .mobile-menu {
          background: rgba(8,10,20,0.97);
          backdrop-filter: blur(20px);
          border-top: 1px solid rgba(99,102,241,0.1);
          padding: 1.5rem 2rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .mobile-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(255,255,255,0.7);
          text-decoration: none;
          font-size: 0.95rem;
          font-weight: 500;
          padding: 0.5rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          transition: color 0.2s;
        }
        .mobile-link:hover { color: #fff; }
        .mobile-cta {
          margin-top: 0.5rem;
          display: block;
          text-align: center;
          padding: 0.85rem;
          background: linear-gradient(135deg, #6366f1, #818cf8);
          color: #fff;
          border-radius: 12px;
          font-weight: 700;
          text-decoration: none;
        }

        /* ── HERO ── */
        .hero-section {
          position: relative;
          z-index: 10;
          max-width: 1280px;
          width: 100%;
          margin: 0 auto;
          padding: 10rem 2rem 5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 1.5rem;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.45rem 1.25rem;
          background: rgba(99,102,241,0.08);
          border: 1px solid rgba(99,102,241,0.2);
          border-radius: 30px;
          font-size: 0.78rem;
          font-weight: 600;
          color: rgba(255,255,255,0.8);
          letter-spacing: 0.3px;
          animation: fadeDown 0.6s ease both;
        }
        .badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 6px #10b981;
          animation: pulseDot 2s ease-in-out infinite;
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        .hero-title {
          font-size: clamp(2.8rem, 6vw, 5rem);
          font-weight: 900;
          line-height: 1.1;
          letter-spacing: -2px;
          animation: fadeUp 0.7s ease 0.1s both;
        }
        .hero-title-gradient {
          background: linear-gradient(135deg, #6366f1 0%, #a5b4fc 40%, #10b981 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-desc {
          font-size: clamp(0.95rem, 2vw, 1.1rem);
          color: rgba(255,255,255,0.5);
          max-width: 680px;
          line-height: 1.75;
          animation: fadeUp 0.7s ease 0.2s both;
        }
        .hero-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          justify-content: center;
          margin-top: 0.5rem;
          animation: fadeUp 0.7s ease 0.3s both;
        }
        .btn-hero-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.9rem 2.25rem;
          background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%);
          color: #fff;
          border-radius: 50px;
          font-weight: 700;
          font-size: 0.92rem;
          text-decoration: none;
          transition: all 0.3s ease;
          box-shadow: 0 8px 25px rgba(99,102,241,0.35);
        }
        .btn-hero-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 40px rgba(99,102,241,0.5);
        }
        .btn-hero-secondary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.9rem 2.25rem;
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.8);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 50px;
          font-weight: 600;
          font-size: 0.92rem;
          text-decoration: none;
          transition: all 0.3s ease;
        }
        .btn-hero-secondary:hover {
          background: rgba(255,255,255,0.08);
          color: #fff;
          border-color: rgba(255,255,255,0.2);
        }

        /* Hero Code Card */
        .hero-card-float {
          margin-top: 2rem;
          background: rgba(15,20,35,0.8);
          border: 1px solid rgba(99,102,241,0.2);
          border-radius: 16px;
          overflow: hidden;
          width: 100%;
          max-width: 520px;
          backdrop-filter: blur(20px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,102,241,0.05);
          animation: fadeUp 0.8s ease 0.4s both;
          text-align: left;
        }
        .hcard-header {
          padding: 0.75rem 1rem;
          background: rgba(255,255,255,0.02);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        .hcard-dot {
          width: 10px; height: 10px;
          border-radius: 50%;
        }
        .hcard-dot.red { background: #f43f5e; }
        .hcard-dot.yellow { background: #f59e0b; }
        .hcard-dot.green { background: #10b981; }
        .hcard-code {
          padding: 1.25rem 1.5rem;
          font-family: 'Fira Code', 'Courier New', monospace;
          font-size: 0.8rem;
          line-height: 1.8;
          color: #e2e8f0;
        }
        .hcard-footer {
          padding: 0.75rem 1.5rem;
          background: rgba(255,255,255,0.02);
          border-top: 1px solid rgba(255,255,255,0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
        }
        .c-kw { color: #818cf8; }
        .c-var { color: #a5b4fc; }
        .c-key { color: #7dd3fc; }
        .c-str { color: #86efac; }
        .c-bool { color: #f9a8d4; }
        .c-comment { color: rgba(255,255,255,0.25); font-style: italic; }
        .c-success { color: #10b981; font-weight: 600; }

        /* ── STATS ── */
        .stats-section {
          position: relative;
          z-index: 10;
          max-width: 1100px;
          width: 100%;
          margin: 0 auto 2rem;
          padding: 0 2rem;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1px;
          background: rgba(99,102,241,0.15);
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid rgba(99,102,241,0.15);
        }
        .stat-item {
          background: rgba(8,11,22,0.9);
          padding: 2.5rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          transition: background 0.3s;
        }
        .stat-item:hover { background: rgba(15,20,40,0.9); }
        .stat-icon {
          width: 44px; height: 44px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 0.25rem;
        }
        .stat-num {
          font-size: 2.5rem;
          font-weight: 900;
          letter-spacing: -2px;
          line-height: 1;
        }
        .stat-label-text {
          font-size: 0.78rem;
          color: rgba(255,255,255,0.45);
          font-weight: 500;
          text-align: center;
        }

        /* ── SECTIONS COMMON ── */
        .section-divider {
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(99,102,241,0.2), transparent);
          margin-bottom: 5rem;
        }
        .section-tag {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #6366f1;
          display: block;
          margin-bottom: 0.75rem;
        }
        .section-title {
          font-size: clamp(1.8rem, 3.5vw, 2.5rem);
          font-weight: 800;
          letter-spacing: -0.5px;
          line-height: 1.15;
          margin-bottom: 1rem;
        }
        .section-desc {
          color: rgba(255,255,255,0.5);
          line-height: 1.75;
          font-size: 0.95rem;
        }

        /* ── ABOUT ── */
        .about-section {
          position: relative;
          z-index: 10;
          max-width: 1280px;
          width: 100%;
          margin: 0 auto;
          padding: 0 2rem 5rem;
        }
        .about-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: start;
        }
        .about-text {}
        .about-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 1.5rem;
        }
        .about-pill {
          padding: 0.3rem 0.9rem;
          background: rgba(99,102,241,0.06);
          border: 1px solid rgba(99,102,241,0.2);
          border-radius: 30px;
          font-size: 0.75rem;
          color: #a5b4fc;
          font-weight: 600;
        }
        .about-cards {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .visi-card {
          background: rgba(99,102,241,0.05);
          border: 1px solid rgba(99,102,241,0.15);
          border-radius: 16px;
          padding: 1.75rem;
          display: flex;
          gap: 1rem;
        }
        .visi-icon {
          width: 36px; height: 36px;
          background: rgba(99,102,241,0.12);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          color: #6366f1;
          flex-shrink: 0;
        }
        .visi-label {
          font-size: 0.68rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #6366f1;
          margin-bottom: 0.5rem;
        }
        .visi-text {
          font-size: 0.875rem;
          color: rgba(255,255,255,0.6);
          line-height: 1.65;
          font-style: italic;
          margin: 0;
        }
        .misi-card {
          background: rgba(16,23,40,0.6);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 1.75rem;
        }
        .misi-label {
          font-size: 0.68rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #a5b4fc;
          margin-bottom: 1rem;
        }
        .misi-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          margin: 0;
          padding: 0;
        }
        .misi-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          font-size: 0.85rem;
          color: rgba(255,255,255,0.6);
          line-height: 1.55;
        }

        /* ── SERVICES ── */
        .services-section {
          position: relative;
          z-index: 10;
          max-width: 1280px;
          width: 100%;
          margin: 0 auto;
          padding: 0 2rem 5rem;
        }
        .services-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }
        .service-card {
          background: rgba(10,14,28,0.7);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          transition: all 0.35s cubic-bezier(0.4,0,0.2,1);
          animation: fadeUp 0.5s ease both;
        }
        .service-card:hover {
          background: rgba(15,20,42,0.9);
          border-color: rgba(99,102,241,0.2);
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(99,102,241,0.1);
        }
        .svc-icon {
          width: 52px; height: 52px;
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
        }
        .svc-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: #f3f4f6;
          line-height: 1.3;
        }
        .svc-desc {
          font-size: 0.855rem;
          color: rgba(255,255,255,0.47);
          line-height: 1.7;
          flex: 1;
        }
        .svc-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
          margin-top: 0.25rem;
        }
        .svc-tag {
          padding: 0.2rem 0.65rem;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 600;
          border: 1px solid;
        }

        /* ── TESTIMONIALS ── */
        .testimonials-section {
          position: relative;
          z-index: 10;
          max-width: 1280px;
          width: 100%;
          margin: 0 auto;
          padding: 0 2rem 5rem;
        }
        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }
        .testimonial-card {
          background: rgba(10,14,28,0.7);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          transition: all 0.3s ease;
        }
        .testimonial-card:hover {
          border-color: rgba(245,158,11,0.2);
          transform: translateY(-3px);
        }
        .testimonial-stars {
          display: flex;
          gap: 0.2rem;
        }
        .testimonial-text {
          font-size: 0.875rem;
          color: rgba(255,255,255,0.6);
          line-height: 1.7;
          flex: 1;
          font-style: italic;
        }
        .testimonial-author {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .t-avatar {
          width: 40px; height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1 0%, #a5b4fc 100%);
          display: flex; align-items: center; justify-content: center;
          font-weight: 700;
          font-size: 0.8rem;
          color: #fff;
          flex-shrink: 0;
        }
        .t-name {
          font-size: 0.85rem;
          font-weight: 700;
          color: #f3f4f6;
        }
        .t-role {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.4);
          margin-top: 0.1rem;
        }

        /* ── CONTACT ── */
        .contact-section {
          position: relative;
          z-index: 10;
          max-width: 1280px;
          width: 100%;
          margin: 0 auto;
          padding: 0 2rem 5rem;
        }
        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: start;
        }
        .contact-cta-box {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: 1.5rem;
          padding: 0.85rem 1.5rem;
          background: rgba(99,102,241,0.06);
          border: 1px solid rgba(99,102,241,0.15);
          border-radius: 12px;
          font-size: 0.85rem;
          color: rgba(255,255,255,0.7);
        }
        .contact-info {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .contact-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem;
          background: rgba(10,14,28,0.5);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 14px;
          transition: all 0.3s ease;
        }
        .contact-item:hover {
          border-color: rgba(99,102,241,0.2);
          transform: translateX(4px);
        }
        .contact-icon {
          width: 44px; height: 44px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .contact-label {
          font-size: 0.72rem;
          color: rgba(255,255,255,0.35);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .contact-value {
          font-size: 0.875rem;
          font-weight: 600;
          color: #f3f4f6;
          margin-top: 0.2rem;
        }

        /* ── CTA BANNER ── */
        .cta-banner {
          position: relative;
          z-index: 10;
          padding: 2rem;
          margin: 2rem auto 4rem;
          max-width: 1280px;
          width: 100%;
        }
        .cta-inner {
          position: relative;
          padding: 5rem 2rem;
          text-align: center;
          background: rgba(99,102,241,0.04);
          border: 1px solid rgba(99,102,241,0.15);
          border-radius: 28px;
          overflow: hidden;
        }
        .cta-glow {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 500px; height: 300px;
          background: radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%);
          pointer-events: none;
        }
        .cta-title {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 900;
          letter-spacing: -1px;
          margin: 0.5rem 0 1rem;
          position: relative;
        }
        .cta-desc {
          color: rgba(255,255,255,0.5);
          font-size: 1rem;
          max-width: 500px;
          margin: 0 auto 2rem;
          line-height: 1.7;
          position: relative;
        }
        .cta-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          position: relative;
        }

        /* ── FOOTER ── */
        .landing-footer {
          position: relative;
          z-index: 10;
          border-top: 1px solid rgba(255,255,255,0.05);
          padding: 4rem 2rem 2rem;
          max-width: 1280px;
          width: 100%;
          margin: 0 auto;
        }
        .footer-top {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 3rem;
          margin-bottom: 3rem;
          padding-bottom: 3rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .footer-tagline {
          font-size: 0.85rem;
          color: rgba(255,255,255,0.4);
          line-height: 1.65;
          margin: 0;
        }
        .footer-links-col {}
        .footer-col-title {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: rgba(255,255,255,0.5);
          margin-bottom: 1rem;
        }
        .footer-link {
          display: block;
          font-size: 0.85rem;
          color: rgba(255,255,255,0.4);
          text-decoration: none;
          padding: 0.3rem 0;
          transition: color 0.2s;
        }
        .footer-link:hover { color: #fff; }
        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.8rem;
          color: rgba(255,255,255,0.3);
          flex-wrap: wrap;
          gap: 1rem;
        }

        /* ── ANIMATIONS ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ── TYPEWRITER ── */
        .typewriter-wrap {
          display: inline-flex;
          align-items: baseline;
          gap: 0px;
        }
        .typewriter-text {
          background: linear-gradient(135deg, #6366f1 0%, #a5b4fc 40%, #10b981 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          min-width: 2ch;
        }
        .typewriter-cursor {
          display: inline-block;
          color: #6366f1;
          font-weight: 300;
          margin-left: 2px;
          animation: cursorBlink 0.85s step-start infinite;
          -webkit-text-fill-color: #6366f1;
        }
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 1024px) {
          .services-grid,
          .testimonials-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .about-grid,
          .contact-grid {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }
        }
        @media (max-width: 768px) {
          .nav-links { display: none; }
          .nav-hamburger { display: block; }
          .btn-nav-cta { display: none; }
          .services-grid,
          .testimonials-grid {
            grid-template-columns: 1fr;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .footer-top {
            grid-template-columns: 1fr;
          }
          .hero-section { padding: 8rem 1.5rem 4rem; }
          .about-section,
          .services-section,
          .testimonials-section,
          .contact-section {
            padding-left: 1.5rem;
            padding-right: 1.5rem;
          }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
