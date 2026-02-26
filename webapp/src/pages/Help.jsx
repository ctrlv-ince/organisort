import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import '../Landing.css';

const helpTopics = [
  {
    icon: '🔑',
    title: 'Account Access',
    description: 'Use the login page for returning users and register if you need a new OrganiSort account.',
    detail: 'If you\'ve forgotten your password, use the Forgot Password link on the login page to receive a secure reset link via email.',
    img: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=600&q=80',
  },
  {
    icon: '📊',
    title: 'Dashboard Navigation',
    description: 'Users and admins are routed to role-specific dashboards after authentication.',
    detail: 'Regular users see their scan history and impact stats. Admins have access to system-wide analytics, user management, and detection oversight.',
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
  },
  {
    icon: '📱',
    title: 'Scanning Items',
    description: 'Point your device camera at any waste item to trigger real-time AI classification.',
    detail: 'For best results, ensure good lighting and hold the item steady. The AI will identify material type and provide disposal guidance within seconds.',
    img: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=80',
  },
  {
    icon: '🛠️',
    title: 'Support Contact',
    description: 'If you encounter issues, use the contact page to reach support and technical help channels.',
    detail: 'Our support team is available Monday to Friday, 9AM–5PM. For urgent technical issues, include your account email and a description of the problem.',
    img: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&q=80',
  },
];

const HelpCard = ({ topic, index }) => {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      className="rounded-[2rem] border border-gray-100 overflow-hidden group hover:shadow-lg hover:border-gray-200 transition-all duration-500 bg-white"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div className="h-40 overflow-hidden relative flex-shrink-0">
        <img src={topic.img} alt={topic.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-4 left-5 text-2xl">{topic.icon}</div>
      </div>
      <div className="p-7">
        <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-2">Guide</p>
        <h3 className="text-lg font-extrabold text-gray-900 mb-2 tracking-tight">{topic.title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed font-medium mb-4">{topic.description}</p>
        <button
          onClick={() => setOpen(!open)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontSize: '13px', fontWeight: 700, padding: 0 }}
        >
          {open ? 'Show less ↑' : 'Learn more ↓'}
        </button>
        <AnimatePresence>
          {open && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: 'hidden' }}
              className="text-gray-400 text-sm leading-relaxed font-medium mt-3 pt-3 border-t border-gray-100"
            >
              {topic.detail}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const Help = () => {
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
            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&q=80"
            alt=""
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            style={{ opacity: 0.1 }}
          />
          <motion.div className="container-pro" initial="hidden" animate="show" variants={stagger} style={{ position: 'relative', zIndex: 10 }}>
            <div className="hero-content" style={{ gridTemplateColumns: '1fr' }}>
              <motion.div className="hero-left" variants={fadeUp} style={{ maxWidth: '720px' }}>
                <div className="hero-badge">Help Center</div>
                <h1 className="hero-title">
                  Find guidance for
                  <br />
                  <span className="hero-title-accent">common platform tasks</span>
                </h1>
                <p className="hero-desc">
                  Browse quick help topics for account management, dashboard usage, and support escalation.
                </p>
                <div className="hero-buttons">
                  <button onClick={() => navigate('/contact')} className="btn-primary btn-large">Contact Support</button>
                  <button onClick={() => navigate('/')} className="btn-outline btn-large">Back to Home</button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Help Topics */}
        <motion.section
          className="py-32 bg-white overflow-hidden"
          initial="hidden" whileInView="show" viewport={{ once: true, margin: '-100px' }} variants={stagger}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <motion.div className="mb-14" variants={fadeUp}>
              <p className="section-label">Help Topics</p>
              <h2 className="section-title">How can we help?</h2>
              <p className="section-subtitle mt-3">Click "Learn more" on any card for expanded guidance.</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {helpTopics.map((topic, i) => (
                <HelpCard key={i} topic={topic} index={i} />
              ))}
            </div>
          </div>
        </motion.section>

        {/* Still need help? */}
        <motion.section
          className="py-20 overflow-hidden"
          style={{ background: '#fafaf8' }}
          initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={stagger}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <motion.div className="bg-white rounded-[2rem] p-10 md:p-14 border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-8" variants={fadeUp}>
              <div>
                <p className="section-label mb-2">Still stuck?</p>
                <h3 className="text-2xl md:text-3xl font-black tracking-tighter text-gray-900 mb-2">Reach our support team</h3>
                <p className="text-gray-400 font-medium text-sm max-w-md">Can't find what you're looking for? Our team is available Monday to Friday to assist with any platform issue.</p>
              </div>
              <button
                onClick={() => navigate('/contact')}
                className="btn-primary btn-large"
                style={{ flexShrink: 0 }}
              >
                Contact Support →
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

export default Help;