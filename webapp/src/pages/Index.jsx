import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import '../Landing.css';

/** Animated counter that counts up when element enters viewport */
const AnimatedCounter = ({ target, duration = 1800 }) => {
  const [display, setDisplay] = useState('0');
  const ref = useRef(null);
  const hasRun = useRef(false);

  // Parse numeric value and suffix from strings like '36+', '100%', '6', 'Live'
  const isText = isNaN(parseInt(target));
  const numericTarget = parseInt(target);
  const suffix = isText ? '' : target.replace(/[0-9]/g, '');

  useEffect(() => {
    if (isText) { setDisplay(target); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasRun.current) {
        hasRun.current = true;
        const start = performance.now();
        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3);
          setDisplay(Math.floor(ease * numericTarget) + suffix);
          if (progress < 1) requestAnimationFrame(tick);
          else setDisplay(target);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, numericTarget, suffix, duration, isText]);

  return <span ref={ref}>{display}</span>;
};

/**
 * Landing Page — OrganiSort
 * Magnesia-inspired: oversized type, full-bleed sections, minimalist palette
 */
const LandingPage = () => {
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

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

  // Scroll spy — track which section is active
  useEffect(() => {
    const sectionIds = ['home', 'features', 'modules', 'how', 'facts']; /* 'testimonials' — add back when reviews are implemented */
    const observers = sectionIds.map(id => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) setActiveSection(id);
      }, { threshold: 0.3 });
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach(o => o && o.disconnect());
  }, []);

  /* TODO: Uncomment when reviews are implemented
  const testimonials = [
    { name: 'Maria Santos', role: 'Environmental Science Student', avatar: 'MS', quote: 'OrganiSort completely changed how I think about waste. I can scan anything in seconds and instantly know exactly where it goes.', rating: 5 },
    { name: 'James Reyes', role: 'Community Garden Coordinator', avatar: 'JR', quote: 'The composting guidance is incredibly accurate. Our community garden has diverted hundreds of kilos from landfill using this app.', rating: 5 },
    { name: 'Ana Cruz', role: 'High School Teacher', avatar: 'AC', quote: 'I use OrganiSort in my classroom to teach sustainability. Students love competing on the leaderboard — it makes recycling actually fun.', rating: 5 },
    { name: 'Luis Mendoza', role: 'Facility Manager', avatar: 'LM', quote: 'The analytics dashboard gives us data we never had before. We\'ve reduced contamination in our recycling bins by a significant margin.', rating: 5 },
  ];
  */

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
    {
      icon: '📸',
      title: 'Scan Your Item',
      description: 'Point your camera at any waste item — food scraps, packaging, or household material. OrganiSort captures it instantly.',
      detail: 'Works in real-time from your smartphone camera. No upload needed — inference happens on-device in milliseconds.',
      img: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80',
    },
    {
      icon: '🧠',
      title: 'AI Classifies It',
      description: 'Our neural network identifies the material type across 36+ categories and maps it to one of 6 disposal classifications.',
      detail: 'Deep learning models trained on thousands of real-world waste samples deliver high-confidence results every time.',
      img: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
    },
    {
      icon: '🗺️',
      title: 'Get Disposal Guidance',
      description: 'Receive instant instructions on how and where to dispose of the item — bin type, facility location, and handling notes.',
      detail: 'Location-aware routing surfaces the nearest certified drop-off points, composting centers, and recycling hubs.',
      img: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80',
    },
    {
      icon: '📊',
      title: 'Track Your Impact',
      description: 'Every scan is logged to your profile. Watch your sustainability score grow and see your contribution to landfill diversion.',
      detail: 'Visualize your footprint reduction over time with beautiful dashboards and compete on community leaderboards.',
      img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    },
  ];

  const features = [
    { icon: '🧠', title: 'State-of-the-Art Core AI', description: 'Instantly identify and categorize over 36 types of organic and non-organic waste using deep neural networks.', details: 'Built to recognize complex material permutations through continuous machine learning.', img: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80' },
    { icon: '📊', title: 'Actionable Insights', description: 'Track your decomposition impact, footprint reduction, and sorting accuracy over time.', details: 'Visualize data through beautiful, interactive real-time reporting dashboards.', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80' },
    { icon: '🗺️', title: 'Smart Disposal Mapping', description: 'Locate the nearest specialized disposal facilities based on what you have scanned.', details: 'Integrated geographic intelligence routes you to optimal disposal centers.', img: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&q=80' },
    { icon: '🚀', title: 'Enterprise Scalability', description: 'Equip facility managers with deep taxonomical datasets and predictive models.', details: 'Lightning-fast cloud architecture for thousands of concurrent scans.', img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80' },
  ];

  const modules = [
    { id: 1, name: 'Instant Analysis', type: 'Core Engine', image: '⚡', desc: 'Sub-second real-time AI inference from your smart device', bg: 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=400&q=80' },
    { id: 2, name: 'Impact Tracking', type: 'Sustainability', image: '🌱', desc: 'Monitor contributions to landfill diversion', bg: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=400&q=80' },
    { id: 3, name: 'Location Routing', type: 'Geography', image: '🗺️', desc: 'Interactive mapping to commercial bins and facilities', bg: 'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=400&q=80' },
    { id: 4, name: 'Social Rankings', type: 'Community', image: '🏆', desc: 'Global and local sustainability competitions', bg: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80' },
    { id: 5, name: 'Deep Analytics', type: 'Enterprise', image: '📊', desc: 'Comprehensive diagnostic metrics and waste flows', bg: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80' },
    { id: 6, name: 'Taxonomy AI', type: 'Data Science', image: '♻️', desc: 'Hierarchical classification for modern materials', bg: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&q=80' },
  ];

  const systemFacts = [
    { number: '36+', label: 'Identifiable Materials', sublabel: 'Trained to recognize specific fruits, vegetables, proteins, and household materials', icon: '♻️', img: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&q=80' },
    { number: '6', label: 'Core Categories', sublabel: 'Automatically sorts scans into actionable disposal classifications', icon: '📊', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80' },
    { number: 'Live', label: 'Visual Inference', sublabel: 'AI backend provides immediate real-time environmental metrics', icon: '⚡', img: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80' },
    { number: '100%', label: 'Traceable History', sublabel: 'Full journey from scan through disposal and impact tracking', icon: '🌱', img: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80' },
    { number: '99%', label: 'Uptime SLA', sublabel: 'Enterprise-grade infrastructure with redundant cloud architecture', icon: '🛡️', img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80' },
    { number: '3', label: 'Disposal Facilities', sublabel: 'Mapped and verified drop-off points surfaced by location routing', icon: '🗺️', img: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&q=80' },
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
            {[
              { href: '#home', label: 'Home', id: 'home' },
              { href: '#features', label: 'Capabilities', id: 'features' },
              { href: '#modules', label: 'Modules', id: 'modules' },
              { href: '#how', label: 'How It Works', id: 'how' },
              { href: '#facts', label: 'Facts', id: 'facts' },
            ].map(({ href, label, id }) => (
              <a
                key={id}
                href={href}
                className="nav-link"
                style={{
                  color: activeSection === id ? '#16a34a' : undefined,
                  fontWeight: activeSection === id ? '700' : undefined,
                  borderBottom: activeSection === id ? '2px solid #16a34a' : '2px solid transparent',
                  paddingBottom: '2px',
                  transition: 'all 0.2s ease',
                }}
              >
                {label}
              </a>
            ))}
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
                  <div className="hero-image-card" style={{ overflow: 'hidden', borderRadius: '2rem', position: 'relative', minHeight: '340px' }}>
                    {/* Rich background photo */}
                    <img
                      src="https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=700&q=80"
                      alt="Household organic waste"
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.1) 100%)' }} />
                    {/* Scan UI overlay */}
                    <div style={{ position: 'relative', zIndex: 10, padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', borderRadius: '999px', padding: '6px 14px', border: '1px solid rgba(255,255,255,0.25)' }}>
                          <span style={{ color: '#fff', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>● Live Scan</span>
                        </div>
                        <div style={{ background: 'rgba(22,163,74,0.85)', backdropFilter: 'blur(8px)', borderRadius: '999px', padding: '6px 14px' }}>
                          <span style={{ color: '#fff', fontSize: '11px', fontWeight: 700 }}>AI Ready</span>
                        </div>
                      </div>
                      {/* Scan frame */}
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, padding: '1rem 0' }}>
                        <div style={{ width: '120px', height: '120px', position: 'relative' }}>
                          <div style={{ position: 'absolute', top: 0, left: 0, width: '28px', height: '28px', borderTop: '3px solid #4ade80', borderLeft: '3px solid #4ade80', borderRadius: '4px 0 0 0' }} />
                          <div style={{ position: 'absolute', top: 0, right: 0, width: '28px', height: '28px', borderTop: '3px solid #4ade80', borderRight: '3px solid #4ade80', borderRadius: '0 4px 0 0' }} />
                          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '28px', height: '28px', borderBottom: '3px solid #4ade80', borderLeft: '3px solid #4ade80', borderRadius: '0 0 0 4px' }} />
                          <div style={{ position: 'absolute', bottom: 0, right: 0, width: '28px', height: '28px', borderBottom: '3px solid #4ade80', borderRight: '3px solid #4ade80', borderRadius: '0 0 4px 0' }} />
                          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1.5px', background: 'linear-gradient(90deg, transparent, #4ade80, transparent)', transform: 'translateY(-50%)', opacity: 0.8 }} />
                        </div>
                      </div>
                      {/* Result chip */}
                      <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: '1rem', padding: '14px 16px', backdropFilter: 'blur(12px)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>🥬</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', fontWeight: 800, color: '#111', letterSpacing: '-0.02em' }}>Organic Waste</div>
                            <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500 }}>Compostable · Green Bin</div>
                          </div>
                          <div style={{ background: '#16a34a', color: '#fff', borderRadius: '999px', padding: '3px 10px', fontSize: '11px', fontWeight: 700 }}>98%</div>
                        </div>
                      </div>
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
                  // src="https://media1.tenor.com/m/UvQUTWLPhBgAAAAC/earth-spinning.gif"
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
          <motion.div className="max-w-7xl mx-auto px-6 lg:px-8 mb-12" variants={fadeUp}>
            <div className="flex justify-between items-end">
              <div>
                <p className="section-label">How It Works</p>
                <h2 className="section-title">The complete<br />journey</h2>
                <p className="section-subtitle mt-3">From scan to certified disposal in four stages.</p>
              </div>
              <div className="hidden md:flex gap-3 items-center">
                <button onClick={() => scrollContainer(highlightsRef, 'left')} className="p-3 rounded-full border border-gray-200 bg-white hover:border-gray-400 transition-colors">
                  <ChevronLeft className="w-5 h-5 text-gray-500" />
                </button>
                <button onClick={() => scrollContainer(highlightsRef, 'right')} className="p-3 rounded-full border border-gray-200 bg-white hover:border-gray-400 transition-colors">
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Step indicator strip */}
            <div className="hidden md:flex items-center mt-10 gap-0">
              {platformHighlights.map((hl, i) => (
                <React.Fragment key={i}>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-7 h-7 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center text-[11px] font-black text-green-700">
                      {i + 1}
                    </div>
                    <span className="text-xs font-semibold text-gray-400 tracking-wide whitespace-nowrap">{hl.title}</span>
                  </div>
                  {i < platformHighlights.length - 1 && (
                    <div className="flex-1 h-px bg-gradient-to-r from-green-200 to-gray-100 mx-3" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </motion.div>

          <motion.div
            ref={highlightsRef}
            className="flex overflow-x-auto gap-6 px-6 lg:px-8 pb-12 snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: 'none' }}
            variants={fadeUp}
          >
            {platformHighlights.map((hl, i) => (
              <motion.div
                key={i}
                className="min-w-[85vw] md:min-w-[680px] snap-center bg-white rounded-[2rem] border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-500 relative overflow-hidden group flex flex-col md:flex-row"
                style={{ minHeight: '280px' }}
                initial={{ opacity: 0, x: 60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                {/* Left: image panel */}
                <div className="md:w-72 h-52 md:h-auto overflow-hidden relative flex-shrink-0 rounded-t-[2rem] md:rounded-t-none md:rounded-l-[2rem]">
                  <img
                    src={hl.img}
                    alt={hl.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20 md:block hidden" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent md:hidden" />
                  {/* Stage badge on image */}
                  <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-sm font-black text-green-700 shadow-sm">
                    {i + 1}
                  </div>
                </div>

                {/* Right: text content */}
                <div className="flex flex-col justify-between p-8 md:p-10 flex-1 relative">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-green-400 opacity-[0.04] blur-3xl rounded-full transform translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700" />
                  <div className="relative z-10">
                    <span className="inline-block px-3 py-1 mb-4 text-[10px] font-bold tracking-widest uppercase text-green-700 bg-green-50 rounded-full border border-green-100">
                      Stage 0{i + 1}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-black tracking-tighter mb-3 text-gray-900">{hl.title}</h3>
                    <p className="text-base text-gray-400 font-medium leading-relaxed">{hl.description}</p>
                  </div>
                  <div className="relative z-10 mt-6 pt-6 border-t border-gray-100 flex items-start gap-4">
                    <div className="flex-shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-green-50 text-xl group-hover:bg-green-500 group-hover:shadow-lg transition-all duration-300">
                      {hl.icon}
                    </div>
                    <p className="text-gray-400 font-medium text-sm leading-relaxed pt-1">{hl.detail}</p>
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

          <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
            <motion.div className="text-center mb-16 mx-auto" variants={fadeUp}>
                <p className="section-label">System Facts</p>
                <h2 className="section-title mx-auto" style={{ maxWidth: '500px' }}>Real-world capabilities</h2>
                <p className="section-subtitle mx-auto mt-3" style={{ maxWidth: '480px' }}>
                  Metrics representing the scale of our automated classification architecture.
                </p>
            </motion.div>

            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" variants={fadeUp}>
              {systemFacts.map((stat, i) => (
                <motion.div
                  key={i}
                  className="rounded-[2rem] relative overflow-hidden group hover:shadow-xl transition-all duration-500"
                  style={{ minHeight: '260px' }}
                  initial={{ opacity: 0, y: 40, scale: 0.96 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -4 }}
                >
                  {/* Background image */}
                  <img
                    src={stat.img}
                    alt={stat.label}
                    className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/15 group-hover:from-black/75 transition-all duration-300" />
                  {/* Green tint on hover */}
                  <div className="absolute inset-0 bg-green-600/0 group-hover:bg-green-600/10 transition-all duration-500" />

                  <div className="relative z-10 p-8 flex flex-col justify-end h-full">
                    <div className="text-3xl mb-3">{stat.icon}</div>
                    <div className="text-5xl font-black text-white tracking-tighter mb-1">
                      <AnimatedCounter target={stat.number} />
                    </div>
                    <div className="text-xs font-bold text-white/90 mb-2 tracking-tight uppercase">{stat.label}</div>
                    {stat.sublabel && <div className="text-xs text-white/55 font-medium leading-relaxed">{stat.sublabel}</div>}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* ========== Testimonials — TODO: uncomment when reviews are implemented ==========
        <motion.section
          id="testimonials"
          className="py-32 bg-white overflow-hidden"
          initial="hidden" whileInView="show" viewport={{ once: true, margin: '-100px' }} variants={stagger}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <motion.div className="flex justify-between items-end mb-14" variants={fadeUp}>
              <div>
                <p className="section-label">Testimonials</p>
                <h2 className="section-title">Trusted by people<br />who care</h2>
                <p className="section-subtitle mt-3">From students to facility managers — real impact, real voices.</p>
              </div>
              <div className="hidden md:flex items-center gap-3 bg-green-50 border border-green-100 rounded-full px-5 py-3">
                <div className="flex -space-x-2">
                  {['MS','JR','AC','LM'].map((init, i) => (
                    <div key={i} className="w-7 h-7 rounded-full bg-green-200 border-2 border-white flex items-center justify-center text-[9px] font-black text-green-800">{init}</div>
                  ))}
                </div>
                <span className="text-xs font-semibold text-green-700">Join early users</span>
              </div>
            </motion.div>

            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6" variants={stagger}>
              {testimonials.map((t, i) => (
                <motion.div
                  key={i}
                  className="bg-white rounded-[2rem] p-8 border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-500 relative overflow-hidden group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ y: -3 }}
                >
                  <div className="absolute top-0 right-0 w-48 h-48 bg-green-400 opacity-[0.04] blur-3xl rounded-full transform translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700" />
                  <div className="relative z-10">
                    <div className="flex gap-1 mb-5">
                      {Array.from({ length: t.rating }).map((_, s) => (
                        <span key={s} className="text-yellow-400 text-sm">★</span>
                      ))}
                    </div>
                    <p className="text-gray-700 font-medium text-base leading-relaxed mb-7 italic">"{t.quote}"</p>
                    <div className="flex items-center gap-3 pt-5 border-t border-gray-100">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-xs font-black text-green-700 flex-shrink-0">
                        {t.avatar}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900 tracking-tight">{t.name}</div>
                        <div className="text-xs text-gray-400 font-medium">{t.role}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>
        ========== End Testimonials ========== */}

        {/* ========== CTA ========== */}
        {!user && (
          <section className="cta-section" style={{ position: 'relative', overflow: 'hidden' }}>
            <img
              src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80"
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-[0.12] pointer-events-none"
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
      <footer style={{ background: '#0f1a0f', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        {/* Subtle green glow blobs */}
        <div style={{ position: 'absolute', top: 0, left: '20%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(22,163,74,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, right: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(74,222,128,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Large faded wordmark */}
        <div style={{ position: 'absolute', bottom: '-20px', left: '50%', transform: 'translateX(-50%)', fontSize: 'clamp(80px, 12vw, 160px)', fontWeight: 900, color: 'rgba(255,255,255,0.03)', letterSpacing: '-0.04em', whiteSpace: 'nowrap', pointerEvents: 'none', userSelect: 'none', lineHeight: 1 }}>
          OrganiSort
        </div>

        <div className="container-pro" style={{ position: 'relative', zIndex: 10 }}>
          {/* Top: brand + tagline */}
          <div style={{ paddingTop: '4rem', paddingBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <svg className="w-5 h-5" fill="none" stroke="#4ade80" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '-0.04em', color: '#fff' }}>OrganiSort</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', fontWeight: 500, maxWidth: '340px', lineHeight: 1.6 }}>
              AI-powered organic waste detection and management. Built for a zero-waste future.
            </p>
          </div>

          {/* Middle: nav grid */}
          <div className="footer-grid" style={{ paddingTop: '3rem', paddingBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="footer-col">
              <h3 style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '16px' }}>Navigate</h3>
              {[['#home','Home'],['#features','Capabilities'],['#modules','Modules'],['#how','How It Works'],['#facts','Facts']].map(([href, label]) => (
                <a key={href} href={href} style={{ display: 'block', color: 'rgba(255,255,255,0.55)', fontSize: '14px', fontWeight: 500, marginBottom: '10px', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color='#4ade80'} onMouseLeave={e => e.target.style.color='rgba(255,255,255,0.55)'}>{label}</a>
              ))}
            </div>
            <div className="footer-col">
              <h3 style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '16px' }}>Account</h3>
              {!user ? (
                <>
                  <a href="/login" style={{ display: 'block', color: 'rgba(255,255,255,0.55)', fontSize: '14px', fontWeight: 500, marginBottom: '10px', textDecoration: 'none' }}
                    onMouseEnter={e => e.target.style.color='#4ade80'} onMouseLeave={e => e.target.style.color='rgba(255,255,255,0.55)'}>Login</a>
                  <a href="/register" style={{ display: 'block', color: 'rgba(255,255,255,0.55)', fontSize: '14px', fontWeight: 500, marginBottom: '10px', textDecoration: 'none' }}
                    onMouseEnter={e => e.target.style.color='#4ade80'} onMouseLeave={e => e.target.style.color='rgba(255,255,255,0.55)'}>Register</a>
                </>
              ) : (
                <a href="/dashboard" style={{ display: 'block', color: 'rgba(255,255,255,0.55)', fontSize: '14px', fontWeight: 500, marginBottom: '10px', textDecoration: 'none' }}
                  onMouseEnter={e => e.target.style.color='#4ade80'} onMouseLeave={e => e.target.style.color='rgba(255,255,255,0.55)'}>Dashboard</a>
              )}
              <a href="/about" style={{ display: 'block', color: 'rgba(255,255,255,0.55)', fontSize: '14px', fontWeight: 500, marginBottom: '10px', textDecoration: 'none' }}
                onMouseEnter={e => e.target.style.color='#4ade80'} onMouseLeave={e => e.target.style.color='rgba(255,255,255,0.55)'}>About</a>
              <a href="/contact" style={{ display: 'block', color: 'rgba(255,255,255,0.55)', fontSize: '14px', fontWeight: 500, marginBottom: '10px', textDecoration: 'none' }}
                onMouseEnter={e => e.target.style.color='#4ade80'} onMouseLeave={e => e.target.style.color='rgba(255,255,255,0.55)'}>Contact</a>
            </div>
            <div className="footer-col">
              <h3 style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '16px' }}>Mission</h3>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', fontWeight: 500, lineHeight: 1.7 }}>
                Every scan is a step toward a cleaner planet. OrganiSort empowers individuals and communities to make smarter waste decisions — one item at a time.
              </p>
              <div style={{ marginTop: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(22,163,74,0.15)', border: '1px solid rgba(22,163,74,0.3)', borderRadius: '999px', padding: '6px 14px' }}>
                <span style={{ color: '#4ade80', fontSize: '11px', fontWeight: 700 }}>🌱 Zero Waste Initiative</span>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', paddingBottom: '2rem', flexWrap: 'wrap', gap: '12px' }}>
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px', fontWeight: 500 }}>
              © {new Date().getFullYear()} OrganiSort. All rights reserved.
            </span>
            <div style={{ display: 'flex', gap: '20px' }}>
              {['Home','Capabilities','Facts'].map(label => (
                <a key={label} href={`#${label.toLowerCase()}`} style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px', textDecoration: 'none', fontWeight: 500 }}
                  onMouseEnter={e => e.target.style.color='rgba(255,255,255,0.6)'} onMouseLeave={e => e.target.style.color='rgba(255,255,255,0.25)'}>{label}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;