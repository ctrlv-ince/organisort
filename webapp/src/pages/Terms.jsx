import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../Landing.css';

const termsSections = [
  {
    icon: '✅',
    title: 'Acceptable Use',
    description: 'Use OrganiSort only for lawful waste detection, reporting, and dashboard management activities.',
    detail: 'You may not use the platform to submit false scan data, attempt to access other users\' accounts, or interfere with the platform\'s infrastructure. Violations may result in account suspension.',
    img: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&q=80',
  },
  {
    icon: '🔑',
    title: 'Account Responsibility',
    description: 'You are responsible for account credentials and all activity performed under your account.',
    detail: 'Keep your login credentials confidential. Notify our support team immediately if you suspect unauthorized access. You are liable for all actions taken through your account.',
    img: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=600&q=80',
  },
  {
    icon: '🔄',
    title: 'Service Updates',
    description: 'Features may evolve over time to improve system performance, reliability, and user experience.',
    detail: 'We reserve the right to update, modify, or discontinue features with reasonable notice. Continued use of the platform after changes constitutes acceptance of the revised terms.',
    img: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80',
  },
];

const Terms = () => {
  const navigate = useNavigate();

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
  };
  const stagger = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.12 } },
  };

  return (
    <div className="app-shell">
      <header>
        <div className="container-pro">
          <div className="logo-section">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="logo-text">OrganiSort</span>
          </div>
          <nav className="desktop-nav">
            <button onClick={() => navigate('/')} className="nav-link">Home</button>
            <button onClick={() => navigate('/about')} className="nav-link">About</button>
            <button onClick={() => navigate('/contact')} className="nav-link">Contact</button>
            <button onClick={() => navigate('/dashboard')} className="nav-link">Dashboard</button>
          </nav>
          <div className="header-right">
            <button onClick={() => navigate('/login')} className="btn-outline">Sign In</button>
            <button onClick={() => navigate('/register')} className="btn-primary">Get Started</button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="hero" style={{ position: 'relative', overflow: 'hidden' }}>
          <img
            src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1600&q=80"
            alt=""
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            style={{ opacity: 0.1 }}
          />
          <motion.div className="container-pro" initial="hidden" animate="show" variants={stagger} style={{ position: 'relative', zIndex: 10 }}>
            <div className="hero-content" style={{ gridTemplateColumns: '1fr' }}>
              <motion.div className="hero-left" variants={fadeUp} style={{ maxWidth: '720px' }}>
                <div className="hero-badge">Terms of Service</div>
                <h1 className="hero-title">
                  Platform terms for
                  <br />
                  <span className="hero-title-accent">responsible usage</span>
                </h1>
                <p className="hero-desc">
                  These terms explain your responsibilities while using OrganiSort features, accounts, and reporting workflows.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Last updated bar */}
        <div style={{ background: '#f0fdf4', borderBottom: '1px solid #bbf7d0' }}>
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center gap-3">
            <span style={{ color: '#16a34a', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Last updated</span>
            <span style={{ color: '#6b7280', fontSize: '12px', fontWeight: 500 }}>January 2025</span>
            <span style={{ color: '#d1d5db', fontSize: '12px' }}>·</span>
            <span style={{ color: '#6b7280', fontSize: '12px', fontWeight: 500 }}>Questions? <button onClick={() => navigate('/contact')} style={{ background: 'none', border: 'none', color: '#16a34a', cursor: 'pointer', fontWeight: 700, fontSize: '12px', padding: 0 }}>Contact us</button></span>
          </div>
        </div>

        {/* Terms Sections */}
        <motion.section
          className="py-32 bg-white overflow-hidden"
          initial="hidden" whileInView="show" viewport={{ once: true, margin: '-100px' }} variants={stagger}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <motion.div className="mb-14" variants={fadeUp}>
              <p className="section-label">Key Terms</p>
              <h2 className="section-title">Terms of use</h2>
              <p className="section-subtitle mt-3">The key policies that apply to all OrganiSort users.</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {termsSections.map((s, i) => (
                <motion.div
                  key={i}
                  className="rounded-[2rem] border border-gray-100 overflow-hidden group hover:shadow-lg hover:border-gray-200 transition-all duration-500 flex flex-col bg-white"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <div className="h-44 overflow-hidden relative flex-shrink-0">
                    <img src={s.img} alt={s.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-4 left-5 text-2xl">{s.icon}</div>
                  </div>
                  <div className="p-7 flex flex-col flex-1">
                    <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-2">Policy</p>
                    <h3 className="text-lg font-extrabold text-gray-900 mb-2 tracking-tight">{s.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed font-medium mb-3">{s.description}</p>
                    <p className="text-gray-400 text-xs leading-relaxed font-medium pt-3 border-t border-gray-100">{s.detail}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Agreement strip */}
        <motion.section
          className="py-20 overflow-hidden"
          style={{ background: '#fafaf8' }}
          initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={stagger}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <motion.div className="bg-white rounded-[2rem] p-10 md:p-14 border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-8" variants={fadeUp}>
              <div>
                <p className="section-label mb-2">Agreement</p>
                <h3 className="text-2xl md:text-3xl font-black tracking-tighter text-gray-900 mb-2">Using OrganiSort means you agree</h3>
                <p className="text-gray-400 font-medium text-sm max-w-md">By creating an account and using the platform, you accept these terms. If you have questions about specific policies, our team is happy to clarify.</p>
              </div>
              <button onClick={() => navigate('/contact')} className="btn-primary btn-large" style={{ flexShrink: 0 }}>
                Contact Us →
              </button>
            </motion.div>
          </div>
        </motion.section>
      </main>

      <footer style={{ background: '#0f1a0f', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: '20%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(22,163,74,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-20px', left: '50%', transform: 'translateX(-50%)', fontSize: 'clamp(80px,12vw,160px)', fontWeight: 900, color: 'rgba(255,255,255,0.03)', letterSpacing: '-0.04em', whiteSpace: 'nowrap', pointerEvents: 'none', userSelect: 'none', lineHeight: 1 }}>OrganiSort</div>
        <div className="container-pro" style={{ position: 'relative', zIndex: 10, paddingTop: '3rem', paddingBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg className="w-5 h-5" fill="none" stroke="#4ade80" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              <span style={{ fontSize: '16px', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em' }}>OrganiSort</span>
            </div>
            <div style={{ display: 'flex', gap: '24px' }}>
              {[['/', 'Home'], ['/about', 'About'], ['/contact', 'Contact']].map(([path, label]) => (
                <button key={path} onClick={() => navigate(path)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}
                  onMouseEnter={e => e.target.style.color = '#4ade80'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.4)'}>{label}</button>
              ))}
            </div>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px' }}>© {new Date().getFullYear()} OrganiSort. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Terms;