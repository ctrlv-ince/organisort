import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../Landing.css';

/**
 * Landing Page Component - OrganiSort
 * Reflects real platform capabilities (web + mobile + admin)
 */
const LandingPage = () => {
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null);

  const featuresRef = useRef(null);
  const modulesRef = useRef(null);
  const highlightsRef = useRef(null);

  const scrollContainer = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setMobileMenuOpen(false);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const slides = [
    {
      title: 'Precision Waste Intelligence',
      subtitle: 'Identify, track, and manage your environmental impact with cutting-edge AI vision.',
      badge: 'Welcome to OrganiSort'
    },
    {
      title: 'Real-Time Ecosystem Analytics',
      subtitle: 'Transform classification data into actionable insights for a zero-waste future.',
      badge: 'Enterprise Grade'
    },
    {
      title: 'Instant Disposal Guidance',
      subtitle: 'Know exactly where and how to recycle any item with location-aware routing.',
      badge: 'Location Intelligence'
    }
  ];

  const platformHighlights = [
    {
      icon: '🔐',
      title: 'Secure & Seamless Access',
      description: 'Your environmental data is protected by enterprise-grade security protocols.',
      detail: 'Enjoy complete peace of mind with instantly encrypted sessions and robust account management.'
    },
    {
      icon: '📱',
      title: 'Mobile-First Scanning',
      description: 'Turn your smartphone into a powerful environmental tool with our native application.',
      detail: 'Scan items on the go and have the data instantly synchronized with your complete profile.'
    },
    {
      icon: '🧾',
      title: 'Comprehensive Traceability',
      description: 'Review your complete history of positive impact, from single scans to yearly aggregates.',
      detail: 'Beautiful dashboards provide immediate visibility into your personal decomposition footprint.'
    },
    {
      icon: '🛠️',
      title: 'Community Leaderboards',
      description: 'Engage with fellow sustainability champions and track your global rank.',
      detail: 'Gamified progress tracking makes building a greener planet rewarding and highly collaborative.'
    }
  ];

  const features = [
    {
      icon: '🧠',
      color: 'pink',
      title: 'State-of-the-Art Core AI',
      description: 'Instantly identify and categorize over 36 types of organic and non-organic waste using deep neural networks.',
      details: 'Built to recognize complex material permutations and evolving through continuous machine learning.'
    },
    {
      icon: '📊',
      color: 'green',
      title: 'Actionable Insights',
      description: 'Track your decomposition impact, footprint reduction, and sorting accuracy over time.',
      details: 'Visualize complex data sets through beautiful, interactive real-time reporting dashboards.'
    },
    {
      icon: '🗺️',
      color: 'yellow',
      title: 'Smart Disposal Mapping',
      description: 'Automatically locate the nearest specialized disposal facilities based on what you have scanned.',
      details: 'Integrated geographic intelligence routes you to optimal composting, recycling, or disposal centers.'
    },
    {
      icon: '🚀',
      color: 'blue',
      title: 'Enterprise Scalability',
      description: 'Equip facility managers with deep taxonomical datasets and predictive generation models.',
      details: 'Lightning-fast cloud architecture designed to reliably support thousands of concurrent organizational scans.'
    }
  ];

  const modules = [
    { id: 1, name: 'Instant Analysis', type: 'Core Engine', image: '⚡', desc: 'Sub-second real-time AI inference directly from your smart device' },
    { id: 2, name: 'Impact Tracking', type: 'Sustainability', image: '🌱', desc: 'Monitor your personal and organizational contributions to landfill diversion' },
    { id: 3, name: 'Location Routing', type: 'Geography', image: '🗺️', desc: 'Interactive mapping to guide you to the correct commercial bins and facilities' },
    { id: 4, name: 'Social Rankings', type: 'Community', image: '🏆', desc: 'Compete globally and locally to become the ultimate sustainability champion' },
    { id: 5, name: 'Deep Analytics', type: 'Enterprise', image: '📊', desc: 'Comprehensive oversight of diagnostic metrics and organizational waste flows' },
    { id: 6, name: 'Taxonomy AI', type: 'Data Science', image: '♻️', desc: 'Deep hierarchical classification algorithms adapting to modern materials' },
  ];

  const systemFacts = [
    { number: '36+', label: 'Identifiable Materials', sublabel: 'Trained to recognize specific fruits, vegetables, proteins, and household materials instantly', icon: '♻️' },
    { number: '6', label: 'Core Categories', sublabel: 'Automatically sorts scans into actionable classifications with designated disposal methods', icon: '📊' },
    { number: 'Live', label: 'Visual Inference', sublabel: 'Processes images via a dedicated AI backend to provide immediate environmental metrics', icon: '⚡' },
    { number: '100%', label: 'Traceable History', sublabel: 'Records user contributions from initial scan through to suggested disposal and impact tracking', icon: '🌱' }
  ];

  // Auto-advance slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  // Framer Motion Variants
  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="app-shell">
      {/* Header */}
      <header>
        <div className="container-pro">
          <div className="logo-section">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="logo-text">OrganiSort</span>
          </div>
          <nav className="desktop-nav">
            <a href="#home" className="nav-link">Home</a>
            <a href="#features" className="nav-link">Capabilities</a>
            <a href="#categories" className="nav-link">Modules</a>
            <a href="#news" className="nav-link">How It Works</a>
            <a href="#impact" className="nav-link">System Facts</a>
            <button onClick={() => navigate('/about')} className="nav-link">About</button>
            <button onClick={() => navigate('/contact')} className="nav-link">Contact</button>
          </nav>
          <div className="header-right">
            {!loading && (
              user ? (
                <>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="btn-outline"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={handleLogout}
                    className="btn-primary"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className="btn-outline"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="btn-primary"
                  >
                    Get Started
                  </button>
                </>
              )
            )}
          </div>
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-menu-btn"
          >
            <span className="menu-icon">{mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}</span>
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <a href="#home" onClick={() => setMobileMenuOpen(false)}>Home</a>
          <a href="#features" onClick={() => setMobileMenuOpen(false)}>Capabilities</a>
          <a href="#categories" onClick={() => setMobileMenuOpen(false)}>Modules</a>
          <a href="#news" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
          <a href="#impact" onClick={() => setMobileMenuOpen(false)}>System Facts</a>
          <button onClick={() => { navigate('/about'); setMobileMenuOpen(false); }}>About</button>
          <button onClick={() => { navigate('/contact'); setMobileMenuOpen(false); }}>Contact</button>
          {!loading && (
            user ? (
              <>
                <button onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }}>Dashboard</button>
                <button onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <button onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}>Sign In</button>
                <button onClick={() => { navigate('/register'); setMobileMenuOpen(false); }}>Get Started</button>
              </>
            )
          )}
        </div>
      )}

      <main>
        {/* Hero Section */}
        <section className="hero" id="home">
          <div className="hero-bg-icons">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 150, repeat: Infinity, ease: "linear" }} className="hero-icon-top">♻️</motion.div>
            <motion.div animate={{ rotate: -360 }} transition={{ duration: 200, repeat: Infinity, ease: "linear" }} className="hero-icon-bottom">🌍</motion.div>
          </div>
          <motion.div
            className="container-pro"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            <div className="hero-content">
              <motion.div className="hero-left" variants={fadeUp}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="hero-badge">
                      {slides[currentSlide].badge}
                    </div>
                    <h1 className="hero-title">
                      OrganiSort
                      <br />
                      <span className="hero-title-accent">{slides[currentSlide].title}</span>
                    </h1>
                    <p className="hero-desc">
                      {slides[currentSlide].subtitle}
                    </p>
                  </motion.div>
                </AnimatePresence>
                <div className="hero-buttons">
                  <button
                    onClick={() => navigate('/register')}
                    className="btn-primary"
                  >
                    Create Account
                  </button>
                  <a href="#features" className="hero-button-secondary">
                    View Capabilities
                  </a>
                </div>
                {/* Slide Indicators */}
                <div className="slide-indicators">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`slide-dot ${index === currentSlide ? 'active' : ''}`}
                    />
                  ))}
                </div>
              </motion.div>
              <motion.div className="hero-right" variants={fadeUp}>
                <div className="hero-image-card">
                  <div className="hero-fruit-display">
                    <div className="recycle-animation-container">
                      <img
                        src="https://media1.tenor.com/m/fPWXdL9FgxIAAAAC/sign-arrows.gif"
                        alt="Recycle Animation"
                        className="recycle-gif-placeholder"
                        style={{ borderRadius: '50%', objectFit: 'cover' }}
                      />
                    </div>
                  </div>
                  <div className="hero-price-badge">
                    <div className="hero-price-label">Organic Waste Detection System</div>
                    <div className="hero-price-value">OrganiSort</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* System Capabilities Carousel */}
        <motion.section
          id="features"
          className="py-20 bg-white overflow-hidden"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.div className="max-w-7xl mx-auto px-6 lg:px-8 mb-8 flex justify-between items-end" variants={fadeUp}>
            <div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-gray-900 mb-1">Capabilities</h2>
              <p className="text-base text-gray-400 font-medium">The core mechanics of the system.</p>
            </div>
            <div className="hidden md:flex gap-3">
              <button onClick={() => scrollContainer(featuresRef, 'left')} className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>
              <button onClick={() => scrollContainer(featuresRef, 'right')} className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                <ChevronRight className="w-6 h-6 text-gray-700" />
              </button>
            </div>
          </motion.div>

          {/* Horizontal Scroller */}
          <motion.div
            ref={featuresRef}
            className="flex overflow-x-auto gap-6 px-6 lg:px-8 pb-12 snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            variants={fadeUp}
          >
            {features.map((feature, index) => (
              <div
                key={index}
                className="min-w-[320px] max-w-[320px] md:min-w-[400px] md:max-w-[400px] snap-center bg-white rounded-[2.5rem] p-8 hover:shadow-md transition-all duration-300 border border-gray-100 flex flex-col justify-between group"
              >
                <div>
                  <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform origin-left">{feature.icon}</div>
                  <h3 className="text-xl font-extrabold text-gray-900 mb-3 tracking-tight">{feature.title}</h3>
                  <p className="text-gray-500 text-base leading-relaxed font-medium">{feature.description}</p>
                </div>
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <p className="text-gray-500 text-sm font-medium">{feature.details}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.section>

        {/* Platform Modules Carousel */}
        <motion.section
          id="categories"
          className="py-20 bg-gray-50 overflow-hidden"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.div className="max-w-7xl mx-auto px-6 lg:px-8 mb-8 flex justify-between items-end" variants={fadeUp}>
            <div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-gray-900 mb-1">Modules</h2>
              <p className="text-base text-gray-400 font-medium">Built-in platform experiences.</p>
            </div>
            <div className="hidden md:flex gap-3">
              <button onClick={() => scrollContainer(modulesRef, 'left')} className="p-3 rounded-full bg-white shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>
              <button onClick={() => scrollContainer(modulesRef, 'right')} className="p-3 rounded-full bg-white shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <ChevronRight className="w-6 h-6 text-gray-700" />
              </button>
            </div>
          </motion.div>

          <motion.div
            ref={modulesRef}
            className="flex overflow-x-auto gap-6 px-6 lg:px-8 pb-12 snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            variants={fadeUp}
          >
            {modules.map((mod) => (
              <div
                key={mod.id}
                className="min-w-[300px] max-w-[300px] snap-center bg-white rounded-[2.5rem] p-8 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-6 opacity-10 text-8xl transform group-hover:scale-125 transition-transform duration-500">
                  {mod.image}
                </div>
                <div className="relative z-10">
                  <span className="inline-block px-3 py-1 mb-4 text-xs font-bold uppercase tracking-wider text-green-700 bg-green-100 rounded-full">
                    {mod.type}
                  </span>
                  <div className="text-4xl mb-4">{mod.image}</div>
                  <h3 className="text-xl font-extrabold text-gray-900 mb-3 tracking-tight">{mod.name}</h3>
                  <p className="text-gray-600 font-medium leading-relaxed mb-6">{mod.desc}</p>
                  <p className="text-xs font-bold text-gray-400 tracking-widest uppercase">Included Base System</p>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.section>

        {/* How It Works Carousel */}
        <motion.section
          id="news"
          className="py-20 bg-white overflow-hidden"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.div className="max-w-7xl mx-auto px-6 lg:px-8 mb-8 flex justify-between items-end" variants={fadeUp}>
            <div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-gray-900 mb-1">How It Works</h2>
              <p className="text-base text-gray-400 font-medium">The complete journey.</p>
            </div>
            <div className="hidden md:flex gap-3">
              <button onClick={() => scrollContainer(highlightsRef, 'left')} className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>
              <button onClick={() => scrollContainer(highlightsRef, 'right')} className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                <ChevronRight className="w-6 h-6 text-gray-700" />
              </button>
            </div>
          </motion.div>

          <motion.div
            ref={highlightsRef}
            className="flex overflow-x-auto gap-8 px-6 lg:px-8 pb-12 snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            variants={fadeUp}
          >
            {platformHighlights.map((hl, index) => (
              <div
                key={index}
                className="min-w-[85vw] md:min-w-[600px] snap-center bg-white rounded-[2.5rem] p-8 md:p-12 text-gray-900 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-500 opacity-10 blur-3xl rounded-full transform translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <span className="inline-block px-4 py-1.5 mb-6 text-sm font-bold tracking-widest bg-green-100 text-green-700 rounded-full">
                      Stage 0{index + 1}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-black tracking-tighter mb-4">{hl.title}</h3>
                    <p className="text-lg text-gray-500 mb-8 max-w-lg font-medium">{hl.description}</p>
                  </div>
                  <div>
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 text-green-600 text-3xl mb-4 group-hover:bg-green-500 group-hover:text-white transition-colors duration-300">
                      {hl.icon}
                    </div>
                    <p className="text-gray-500 font-medium max-w-md">{hl.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.section>

        {/* Stats/Impact Section - Redesigned to match a clean light aesthetic */}
        <motion.section
          id="impact"
          className="py-24 bg-gray-50 text-gray-900 overflow-hidden relative"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-green-500 opacity-10 blur-3xl rounded-full transform translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 opacity-5 blur-3xl rounded-full transform -translate-x-1/3 translate-y-1/3"></div>

          <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
            <motion.div className="text-center mb-16" variants={fadeUp}>
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-4 text-gray-900">System Facts</h2>
              <p className="text-base text-gray-400 font-medium max-w-2xl mx-auto">
                Real-world metrics representing the scale capabilities of our automated classification architecture.
              </p>
            </motion.div>

            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" variants={fadeUp}>
              {systemFacts.map((stat, index) => (
                <motion.div
                  key={index}
                  className="bg-white shadow-sm hover:shadow-xl rounded-[2rem] p-8 border border-gray-100 flex flex-col items-center text-center relative overflow-hidden group transition-all duration-300"
                  whileHover={{ y: -3 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="text-5xl mb-6">{stat.icon}</div>
                  <div className="text-5xl md:text-6xl font-black text-gray-900 tracking-tighter mb-3">{stat.number}</div>
                  <div className="text-sm font-bold text-gray-900 mb-2 tracking-tight">{stat.label}</div>
                  {stat.sublabel && <div className="text-sm text-gray-500 font-medium leading-relaxed">{stat.sublabel}</div>}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* CTA Section */}
        {!user && (
          <section className="cta-section">
            <div className="container-pro">
              <div className="cta-content">
                <h2>Ready to Detect Organic Waste?</h2>
                <p>Create an account, access your dashboard, and manage your detections.</p>
                <div className="cta-buttons">
                  <button
                    onClick={() => navigate('/register')}
                    className="btn-primary btn-large"
                  >
                    Get Started
                  </button>
                  <button
                    onClick={() => navigate('/login')}
                    className="btn-outline btn-large"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer>
        <div className="container-pro">
          <div className="footer-grid">
            {/* About */}
            <div className="footer-col">
              <div className="footer-logo">
                <svg className="inline w-5 h-5 mr-1 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                OrganiSort
              </div>
              <p className="footer-desc">
                Organic Waste Detection & Management System.
                Built with authenticated dashboards, detection history, and admin monitoring tools.
              </p>
            </div>

            {/* Quick Links */}
            <div className="footer-col">
              <h3 className="footer-title">Quick Links</h3>
              <a href="#home" className="footer-link">Home</a>
              <a href="#features" className="footer-link">Capabilities</a>
              <a href="#categories" className="footer-link">Modules</a>
              <a href="#news" className="footer-link">How It Works</a>
              <button onClick={() => navigate('/about')} className="footer-link">About</button>
              <button onClick={() => navigate('/contact')} className="footer-link">Contact</button>
              {!user && (
                <button onClick={() => navigate('/register')} className="footer-link">Sign Up</button>
              )}
            </div>

            {/* Resources */}
            <div className="footer-col">
              <h3 className="footer-title">Resources</h3>
              {!user && (
                <>
                  <a href="/login" className="footer-link">Login</a>
                  <a href="/register" className="footer-link">Register</a>
                </>
              )}
              {user && (
                <a href="/dashboard" className="footer-link">Dashboard</a>
              )}
              <a href="/about" className="footer-link">About</a>
              <a href="/contact" className="footer-link">Contact</a>
              <a href="#impact" className="footer-link">System Facts</a>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-links">
              <a href="#home">Home</a>
              <span>•</span>
              <a href="#features">Capabilities</a>
              <span>•</span>
              <a href="#impact">System Facts</a>
            </div>
            <div className="footer-copyright">
              © {new Date().getFullYear()} OrganiSort. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div >
  );
};

export default LandingPage;
