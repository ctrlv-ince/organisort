import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../Landing.css';

const contactChannels = [
  {
    icon: '📧',
    title: 'Email',
    value: 'organisort.support@example.com',
    description: 'For feature requests, onboarding, and account concerns.',
    img: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=600&q=80',
  },
  {
    icon: '💬',
    title: 'General Inquiries',
    value: 'Mon – Fri, 9:00 AM – 5:00 PM',
    description: 'Questions about app usage, workflows, and reporting.',
    img: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&q=80',
  },
  {
    icon: '🛠️',
    title: 'Technical Help',
    value: 'Dashboard + API support',
    description: 'Troubleshooting authentication, scans, and detection history.',
    img: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80',
  },
];

const Contact = () => {
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
            <button onClick={() => navigate('/#features')} className="nav-link">Capabilities</button>
            <button onClick={() => navigate('/#modules')} className="nav-link">Modules</button>
            <button onClick={() => navigate('/#how')} className="nav-link">How It Works</button>
            <button onClick={() => navigate('/#facts')} className="nav-link">Facts</button>
            <button onClick={() => navigate('/about')} className="nav-link">About</button>
            <button onClick={() => navigate('/contact')} className="nav-link" style={{ color: '#16a34a', fontWeight: 700, borderBottom: '2px solid #16a34a', paddingBottom: '2px' }}>Contact</button>
          </nav>
          <div className="header-right">
            {!loading && (
              user ? (
                <>
                  <button onClick={() => navigate('/dashboard')} className="btn-outline">Dashboard</button>
                  <button onClick={handleLogout} className="btn-primary">Logout</button>
                </>
              ) : (
                <>
                  <button onClick={() => navigate('/login')} className="btn-outline">Sign In</button>
                  <button onClick={() => navigate('/register')} className="btn-primary">Get Started</button>
                </>
              )
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="hero" style={{ position: 'relative', overflow: 'hidden' }}>
          <img
            src="https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=1600&q=80"
            alt=""
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            style={{ opacity: 0.1 }}
          />
          <motion.div className="container-pro" initial="hidden" animate="show" variants={stagger} style={{ position: 'relative', zIndex: 10 }}>
            <div className="hero-content" style={{ gridTemplateColumns: '1fr' }}>
              <motion.div className="hero-left" variants={fadeUp} style={{ maxWidth: '720px' }}>
                <div className="hero-badge">Contact OrganiSort</div>
                <h1 className="hero-title">
                  We're here to help
                  <br />
                  <span className="hero-title-accent">with your platform usage</span>
                </h1>
                <p className="hero-desc">
                  Reach out for support with authentication, dashboard access, and detection workflow concerns.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Contact Channels */}
        <motion.section
          className="py-32 bg-white overflow-hidden"
          initial="hidden" whileInView="show" viewport={{ once: true, margin: '-100px' }} variants={stagger}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <motion.div className="mb-14" variants={fadeUp}>
              <p className="section-label">Reach Us</p>
              <h2 className="section-title">Contact channels</h2>
              <p className="section-subtitle mt-3">Choose the right channel for your inquiry.</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {contactChannels.map((c, i) => (
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
                    <img src={c.img} alt={c.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-4 left-5 text-2xl">{c.icon}</div>
                  </div>
                  <div className="p-7 flex flex-col flex-1">
                    <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-2">{c.title}</p>
                    <h3 className="text-base font-extrabold text-gray-900 mb-2 tracking-tight">{c.value}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed font-medium">{c.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Quick info bar */}
        <motion.section
          className="py-20 overflow-hidden"
          style={{ background: '#fafaf8' }}
          initial="hidden" whileInView="show" viewport={{ once: true, margin: '-100px' }} variants={stagger}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: '⏱️', label: 'Response Time', value: 'Within 24 hours' },
                { icon: '📅', label: 'Support Hours', value: 'Mon – Fri, 9AM–5PM' },
                { icon: '🌍', label: 'Coverage', value: 'Available online' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="bg-white rounded-[2rem] p-8 border border-gray-100 flex items-center gap-5"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <div className="text-3xl flex-shrink-0">{item.icon}</div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
                    <p className="text-base font-extrabold text-gray-900 tracking-tight">{item.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* CTA */}
        <section className="cta-section" style={{ position: 'relative', overflow: 'hidden' }}>
          <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80" alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.12] pointer-events-none" />
          <motion.div className="container-pro" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <div className="cta-content">
              <h2>Need a quick route?</h2>
              <p>Jump back to landing, learn more about OrganiSort, or continue to your dashboard.</p>
              <div className="cta-buttons">
                <button onClick={() => navigate('/')} className="btn-primary btn-large">Back to Home</button>
                <button onClick={() => navigate('/about')} className="btn-outline btn-large">About Page</button>
              </div>
            </div>
          </motion.div>
        </section>
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

export default Contact;