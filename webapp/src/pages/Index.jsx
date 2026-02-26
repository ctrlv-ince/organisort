import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import '../Landing.css';

/**
 * Landing Page — OrganiSort
 * Magnesia-inspired: oversized type, full-bleed sections, minimalist palette
 */
const LandingPage = () => {
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const featuresRef = useRef(null);
  const modulesRef = useRef(null);
  const highlightsRef = useRef(null);

  // Hero parallax
  const { scrollY } = useScroll();
  const heroIconTopY = useTransform(scrollY, [0, 600], [0, -120]);
  const heroIconBottomY = useTransform(scrollY, [0, 600], [0, -80]);
  const heroTextY = useTransform(scrollY, [0, 500], [0, 50]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.2]);
  const heroImageY = useTransform(scrollY, [0, 500], [0, -40]);

  const scrollContainer = (ref, direction) => {
    if (ref.current) {
      ref.current.scrollBy({ left: direction === 'left' ? -350 : 350, behavior: 'smooth' });
    }
  };

  const handleLogout = async () => {
    try { await logout(); navigate('/'); setMobileMenuOpen(false); }
    catch (err) { console.error('Logout error:', err); }
  };

  const slides = [
    { title: 'Precision Waste Intelligence', subtitle: 'Identify, track, and manage organic waste with cutting-edge AI vision technology.', badge: 'AI-Powered' },
    { title: 'Real-Time Ecosystem Analytics', subtitle: 'Transform classification data into actionable insights for a zero-waste future.', badge: 'Enterprise Grade' },
    { title: 'Instant Disposal Guidance', subtitle: 'Know exactly where and how to recycle any item with location-aware routing.', badge: 'Location Intelligence' },
  ];

  const platformHighlights = [
    { icon: '🔐', title: 'Secure & Seamless Access', description: 'Enterprise-grade security for your environmental data with encrypted sessions.', detail: 'Complete peace of mind with robust account management and authentication.' },
    { icon: '📱', title: 'Mobile-First Scanning', description: 'Turn your smartphone into a powerful environmental intelligence tool.', detail: 'Scan items on the go with instant data synchronization to your profile.' },
    { icon: '🧾', title: 'Comprehensive Traceability', description: 'Review your complete history — from single scans to yearly aggregates.', detail: 'Beautiful dashboards provide visibility into your decomposition footprint.' },
    { icon: '🛠️', title: 'Community Leaderboards', description: 'Track your global rank among sustainability champions.', detail: 'Gamified progress tracking makes building a greener planet rewarding.' },
  ];

  const features = [
    { icon: '🧠', title: 'State-of-the-Art Core AI', description: 'Instantly identify and categorize over 36 types of organic and non-organic waste using deep neural networks.', details: 'Built to recognize complex material permutations through continuous machine learning.', img: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80' },
    { icon: '📊', title: 'Actionable Insights', description: 'Track your decomposition impact, footprint reduction, and sorting accuracy over time.', details: 'Visualize data through beautiful, interactive real-time reporting dashboards.', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80' },
    { icon: '🗺️', title: 'Smart Disposal Mapping', description: 'Locate the nearest specialized disposal facilities based on what you have scanned.', details: 'Integrated geographic intelligence routes you to optimal disposal centers.', img: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&q=80' },
    { icon: '🚀', title: 'Enterprise Scalability', description: 'Equip facility managers with deep taxonomical datasets and predictive models.', details: 'Lightning-fast cloud architecture for thousands of concurrent scans.', img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80' },
  ];

  const modules = [
    { id: 1, name: 'Instant Analysis', type: 'Core Engine', image: '⚡', desc: 'Sub-second real-time AI inference from your smart device', bg: 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=400&q=80' },
    { id: 2, name: 'Impact Tracking', type: 'Sustainability', image: '🌱', desc: 'Monitor contributions to landfill diversion', bg: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&q=80' },
    { id: 3, name: 'Location Routing', type: 'Geography', image: '🗺️', desc: 'Interactive mapping to commercial bins and facilities', bg: 'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=400&q=80' },
    { id: 4, name: 'Social Rankings', type: 'Community', image: '🏆', desc: 'Global and local sustainability competitions', bg: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80' },
    { id: 5, name: 'Deep Analytics', type: 'Enterprise', image: '📊', desc: 'Comprehensive diagnostic metrics and waste flows', bg: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80' },
    { id: 6, name: 'Taxonomy AI', type: 'Data Science', image: '♻️', desc: 'Hierarchical classification for modern materials', bg: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&q=80' },
  ];

  const systemFacts = [
    { number: '36+', label: 'Identifiable Materials', sublabel: 'Trained to recognize specific fruits, vegetables, proteins, and household materials', icon: '♻️' },
    { number: '6', label: 'Core Categories', sublabel: 'Automatically sorts scans into actionable classifications', icon: '📊' },
    { number: 'Live', label: 'Visual Inference', sublabel: 'AI backend provides immediate environmental metrics', icon: '⚡' },
    { number: '100%', label: 'Traceable History', sublabel: 'Full journey from scan through disposal and impact tracking', icon: '🌱' },
  ];

  useEffect(() => {
    const interval = setInterval(() => setCurrentSlide(prev => (prev + 1) % slides.length), 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  // Animation variants
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
      {/* ========== Header ========== */}
      <header>
        <div className="container-pro">
          <div className="logo-section">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="logo-text">OrganiSort</span>
          </div>
          <nav className="desktop-nav">
            <a href="#home" className="nav-link">Home</a>
            <a href="#features" className="nav-link">Capabilities</a>
            <a href="#modules" className="nav-link">Modules</a>
            <a href="#how" className="nav-link">How It Works</a>
            <a href="#facts" className="nav-link">Facts</a>
            <button onClick={() => navigate('/about')} className="nav-link">About</button>
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
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="mobile-menu-btn">
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <a href="#home" onClick={() => setMobileMenuOpen(false)}>Home</a>
          <a href="#features" onClick={() => setMobileMenuOpen(false)}>Capabilities</a>
          <a href="#modules" onClick={() => setMobileMenuOpen(false)}>Modules</a>
          <a href="#how" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
          <a href="#facts" onClick={() => setMobileMenuOpen(false)}>Facts</a>
          <button onClick={() => { navigate('/about'); setMobileMenuOpen(false); }}>About</button>
          <button onClick={() => { navigate('/contact'); setMobileMenuOpen(false); }}>Contact</button>
          {!loading && (user ? (
            <>
              <button onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }}>Dashboard</button>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <button onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}>Sign In</button>
              <button onClick={() => { navigate('/register'); setMobileMenuOpen(false); }}>Get Started</button>
            </>
          ))}
        </div>
      )}

      <main>
        {/* ========== Hero ========== */}
        <section className="hero" id="home" style={{ position: 'relative' }}>
          {/* Background image for visual richness */}
          <img
            src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600&q=80"
            alt=""
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            style={{ opacity: 0.15 }}
          />
          <div className="hero-bg-icons">
            <motion.div style={{ y: heroIconTopY }} className="hero-icon-top">♻️</motion.div>
            <motion.div style={{ y: heroIconBottomY }} className="hero-icon-bottom">🌍</motion.div>
          </div>
          <motion.div className="container-pro" initial="hidden" animate="show" variants={stagger}>
            <div className="hero-content">
              <motion.div className="hero-left" variants={fadeUp} style={{ y: heroTextY, opacity: heroOpacity }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="hero-badge">{slides[currentSlide].badge}</div>
                    <h1 className="hero-title">
                      OrganiSort<br />
                      <span className="hero-title-accent">{slides[currentSlide].title}</span>
                    </h1>
                    <p className="hero-desc">{slides[currentSlide].subtitle}</p>
                  </motion.div>
                </AnimatePresence>
                <div className="hero-buttons">
                  <button onClick={() => navigate('/register')} className="btn-primary btn-large">
                    Create Account
                  </button>
                  <a href="#features" className="hero-button-secondary">
                    Explore Capabilities →
                  </a>
                </div>
                <div className="slide-indicators">
                  {slides.map((_, i) => (
                    <button key={i} onClick={() => setCurrentSlide(i)} className={`slide-dot ${i === currentSlide ? 'active' : ''}`} />
                  ))}
                </div>
              </motion.div>
              <motion.div className="hero-right" variants={fadeUp} style={{ y: heroImageY }}>
                <div style={{ position: 'relative' }}>
                  <div className="hero-image-card">
                    <div className="hero-fruit-display">
                      <div className="recycle-animation-container">
                        <img
                          src="https://media1.tenor.com/m/fPWXdL9FgxIAAAAC/sign-arrows.gif"
                          alt="Recycle Animation"
                          className="recycle-gif-placeholder"
                          style={{ borderRadius: '50%', objectFit: 'cover' }}
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>
                    <div className="hero-price-badge">
                      <div className="hero-price-label">Organic Waste Detection</div>
                      <div className="hero-price-value">OrganiSort</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* ========== Capabilities ========== */}
        <motion.section
          id="features"
          className="py-32 bg-white overflow-hidden"
          initial="hidden" whileInView="show" viewport={{ once: true, margin: '-100px' }} variants={stagger}
        >
          <motion.div className="max-w-7xl mx-auto px-6 lg:px-8 mb-10" variants={fadeUp}>
            <div className="flex justify-between items-end">
              <div>
                <p className="section-label">Capabilities</p>
                <h2 className="section-title">What powers<br />the system</h2>
                <p className="section-subtitle mt-3">The core mechanics behind intelligent waste classification.</p>
              </div>
              <div className="hidden md:flex gap-3 items-center">
                {/* Animated globe decoration */}
                <img
                  src="https://media1.tenor.com/m/UvQUTWLPhBgAAAAC/earth-spinning.gif"
                  alt=""
                  className="w-12 h-12 rounded-full opacity-60 mr-3"
                  style={{ mixBlendMode: 'luminosity' }}
                />
                <button onClick={() => scrollContainer(featuresRef, 'left')} className="p-3 rounded-full border border-gray-200 hover:border-gray-400 transition-colors bg-white">
                  <ChevronLeft className="w-5 h-5 text-gray-500" />
                </button>
                <button onClick={() => scrollContainer(featuresRef, 'right')} className="p-3 rounded-full border border-gray-200 hover:border-gray-400 transition-colors bg-white">
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
          </motion.div>

          <motion.div
            ref={featuresRef}
            className="flex overflow-x-auto gap-6 px-6 lg:px-8 pb-12 snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: 'none' }}
            variants={fadeUp}
          >
            {features.map((f, i) => (
              <motion.div
                key={i}
                className="min-w-[320px] max-w-[320px] md:min-w-[380px] md:max-w-[380px] snap-center bg-white rounded-[2rem] border border-gray-100 flex flex-col justify-between group hover:shadow-lg hover:border-gray-200 transition-all duration-500 overflow-hidden"
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                {/* Cover image */}
                <div className="h-40 overflow-hidden">
                  <img
                    src={f.img}
                    alt={f.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                </div>
                <div className="p-8 flex flex-col flex-1 justify-between">
                  <div>
                    <div className="text-3xl mb-4">{f.icon}</div>
                    <h3 className="text-lg font-extrabold text-gray-900 mb-2 tracking-tight">{f.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed font-medium">{f.description}</p>
                  </div>
                  <div className="mt-6 pt-5 border-t border-gray-100">
                    <p className="text-gray-400 text-xs font-medium leading-relaxed">{f.details}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* ========== Modules ========== */}
        <motion.section
          id="modules"
          className="py-32 overflow-hidden"
          style={{ background: '#fafaf8' }}
          initial="hidden" whileInView="show" viewport={{ once: true, margin: '-100px' }} variants={stagger}
        >
          <motion.div className="max-w-7xl mx-auto px-6 lg:px-8 mb-10" variants={fadeUp}>
            <div className="flex justify-between items-end">
              <div>
                <p className="section-label">Modules</p>
                <h2 className="section-title">Built-in platform<br />experiences</h2>
                <p className="section-subtitle mt-3">Every module included in the base system.</p>
              </div>
              <div className="hidden md:flex gap-3">
                <button onClick={() => scrollContainer(modulesRef, 'left')} className="p-3 rounded-full border border-gray-200 bg-white hover:border-gray-400 transition-colors">
                  <ChevronLeft className="w-5 h-5 text-gray-500" />
                </button>
                <button onClick={() => scrollContainer(modulesRef, 'right')} className="p-3 rounded-full border border-gray-200 bg-white hover:border-gray-400 transition-colors">
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
          </motion.div>

          <motion.div
            ref={modulesRef}
            className="flex overflow-x-auto gap-6 px-6 lg:px-8 pb-12 snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: 'none' }}
            variants={fadeUp}
          >
            {modules.map((mod, i) => (
              <motion.div
                key={mod.id}
                className="min-w-[280px] max-w-[280px] snap-center rounded-[2rem] group relative overflow-hidden hover:shadow-lg transition-all duration-500"
                style={{ minHeight: '360px' }}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
              >
                {/* Background image */}
                <img
                  src={mod.bg}
                  alt={mod.name}
                  className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
                <div className="relative z-10 p-8 flex flex-col justify-end h-full">
                  <span className="inline-block px-3 py-1 mb-3 text-[10px] font-bold uppercase tracking-widest text-white/90 bg-white/15 rounded-full border border-white/20 w-fit backdrop-blur-sm">
                    {mod.type}
                  </span>
                  <div className="text-2xl mb-2">{mod.image}</div>
                  <h3 className="text-lg font-extrabold text-white mb-1 tracking-tight">{mod.name}</h3>
                  <p className="text-white/70 font-medium text-sm leading-relaxed">{mod.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* ========== How It Works ========== */}
        <motion.section
          id="how"
          className="py-32 bg-white overflow-hidden"
          initial="hidden" whileInView="show" viewport={{ once: true, margin: '-100px' }} variants={stagger}
        >
          <motion.div className="max-w-7xl mx-auto px-6 lg:px-8 mb-10" variants={fadeUp}>
            <div className="flex justify-between items-end">
              <div>
                <p className="section-label">How It Works</p>
                <h2 className="section-title">The complete<br />journey</h2>
                <p className="section-subtitle mt-3">From scan to certified disposal in four stages.</p>
              </div>
              <div className="hidden md:flex gap-3">
                <button onClick={() => scrollContainer(highlightsRef, 'left')} className="p-3 rounded-full border border-gray-200 bg-white hover:border-gray-400 transition-colors">
                  <ChevronLeft className="w-5 h-5 text-gray-500" />
                </button>
                <button onClick={() => scrollContainer(highlightsRef, 'right')} className="p-3 rounded-full border border-gray-200 bg-white hover:border-gray-400 transition-colors">
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
          </motion.div>

          <motion.div
            ref={highlightsRef}
            className="flex overflow-x-auto gap-8 px-6 lg:px-8 pb-12 snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: 'none' }}
            variants={fadeUp}
          >
            {platformHighlights.map((hl, i) => (
              <motion.div
                key={i}
                className="min-w-[85vw] md:min-w-[560px] snap-center bg-white rounded-[2rem] p-8 md:p-12 border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-500 relative overflow-hidden group"
                initial={{ opacity: 0, x: 60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-400 opacity-[0.04] blur-3xl rounded-full transform translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700" />
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <span className="inline-block px-3 py-1 mb-5 text-[10px] font-bold tracking-widest uppercase text-green-700 bg-green-50 rounded-full border border-green-100">
                      Stage 0{i + 1}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-black tracking-tighter mb-3 text-gray-900">{hl.title}</h3>
                    <p className="text-base text-gray-400 mb-8 max-w-lg font-medium">{hl.description}</p>
                  </div>
                  <div>
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-green-50 text-2xl mb-3 group-hover:bg-green-500 group-hover:text-white group-hover:shadow-lg transition-all duration-300">
                      {hl.icon}
                    </div>
                    <p className="text-gray-400 font-medium text-sm max-w-md">{hl.detail}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* ========== System Facts ========== */}
        <motion.section
          id="facts"
          className="py-32 overflow-hidden relative"
          style={{ background: '#fafaf8' }}
          initial="hidden" whileInView="show" viewport={{ once: true, margin: '-100px' }} variants={stagger}
        >
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-green-400 opacity-[0.04] blur-3xl rounded-full transform translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-400 opacity-[0.03] blur-3xl rounded-full transform -translate-x-1/3 translate-y-1/3" />

          {/* Floating recycling animation */}
          <motion.img
            src="https://media.giphy.com/media/l378z4uvJpfQHvMB2/giphy.gif"
            alt=""
            className="absolute bottom-8 right-8 w-20 h-20 rounded-full opacity-20 pointer-events-none hidden lg:block object-cover"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />

          <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
            <motion.div className="text-center mb-16" variants={fadeUp}>
              <p className="section-label">System Facts</p>
              <h2 className="section-title mx-auto" style={{ maxWidth: '500px' }}>Real-world capabilities</h2>
              <p className="section-subtitle mx-auto mt-3" style={{ maxWidth: '480px' }}>
                Metrics representing the scale of our automated classification architecture.
              </p>
            </motion.div>

            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" variants={fadeUp}>
              {systemFacts.map((stat, i) => (
                <motion.div
                  key={i}
                  className="bg-white rounded-[2rem] p-8 border border-gray-100 flex flex-col items-center text-center relative overflow-hidden group hover:shadow-lg hover:border-gray-200 transition-all duration-500"
                  initial={{ opacity: 0, y: 40, scale: 0.96 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -4 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="text-4xl mb-5">{stat.icon}</div>
                    <div className="text-5xl font-black text-gray-900 tracking-tighter mb-2">{stat.number}</div>
                    <div className="text-xs font-bold text-gray-900 mb-1.5 tracking-tight uppercase">{stat.label}</div>
                    {stat.sublabel && <div className="text-xs text-gray-400 font-medium leading-relaxed max-w-[220px]">{stat.sublabel}</div>}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* ========== CTA ========== */}
        {!user && (
          <section className="cta-section" style={{ position: 'relative', overflow: 'hidden' }}>
            {/* Animated nature GIF background */}
            <img
              src="https://media1.tenor.com/m/fPWXdL9FgxIAAAAC/sign-arrows.gif"
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-[0.1] pointer-events-none"
              referrerPolicy="no-referrer"
            />
            <motion.div
              className="container-pro"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div className="cta-content">
                <h2>Ready to detect<br />organic waste?</h2>
                <p>Create an account, access your dashboard, and start managing your environmental impact.</p>
                <div className="cta-buttons">
                  <button onClick={() => navigate('/register')} className="btn-primary btn-large">Get Started</button>
                  <button onClick={() => navigate('/login')} className="btn-outline btn-large">Sign In</button>
                </div>
              </div>
            </motion.div>
          </section>
        )}
      </main>

      {/* ========== Footer ========== */}
      <footer>
        <div className="container-pro">
          <div className="footer-grid">
            <div className="footer-col">
              <div className="footer-logo">
                <svg className="inline w-4 h-4 mr-1 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                OrganiSort
              </div>
              <p className="footer-desc">
                Organic Waste Detection & Management System. Built with AI-powered scanning, authenticated dashboards, and admin monitoring tools.
              </p>
            </div>
            <div className="footer-col">
              <h3 className="footer-title">Navigation</h3>
              <a href="#home" className="footer-link">Home</a>
              <a href="#features" className="footer-link">Capabilities</a>
              <a href="#modules" className="footer-link">Modules</a>
              <a href="#how" className="footer-link">How It Works</a>
              <button onClick={() => navigate('/about')} className="footer-link">About</button>
              <button onClick={() => navigate('/contact')} className="footer-link">Contact</button>
            </div>
            <div className="footer-col">
              <h3 className="footer-title">Account</h3>
              {!user ? (
                <>
                  <a href="/login" className="footer-link">Login</a>
                  <a href="/register" className="footer-link">Register</a>
                </>
              ) : (
                <a href="/dashboard" className="footer-link">Dashboard</a>
              )}
              <a href="/about" className="footer-link">About</a>
              <a href="/contact" className="footer-link">Contact</a>
              <a href="#facts" className="footer-link">System Facts</a>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-links">
              <a href="#home">Home</a>
              <span>·</span>
              <a href="#features">Capabilities</a>
              <span>·</span>
              <a href="#facts">Facts</a>
            </div>
            <div className="footer-copyright">
              © {new Date().getFullYear()} OrganiSort. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
