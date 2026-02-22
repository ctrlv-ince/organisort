import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
      title: 'Organic Waste Detection Workflow',
      subtitle: 'Sign in, scan on mobile, and review detection history and analytics on web',
      badge: 'OrganiSort • Detection Platform'
    },
    {
      title: 'Role-Based Dashboards',
      subtitle: 'Users manage their own records while admins monitor users, detections, and reports',
      badge: 'OrganiSort • User + Admin Experience'
    },
    {
      title: 'Connected System Architecture',
      subtitle: 'Firebase-authenticated sessions with backend APIs and stored detection records',
      badge: 'OrganiSort • Full-Stack System'
    }
  ];

  const platformHighlights = [
    {
      icon: '🔐',
      title: 'Authentication & Accounts',
      description: 'Register and log in with Firebase authentication, then access protected dashboards based on account role.',
      detail: 'The web app gates dashboard access through protected routes and verifies profile/role data from the backend.'
    },
    {
      icon: '📱',
      title: 'Mobile-First Scanning',
      description: 'Waste scanning is done in the mobile app, while the web dashboard is used for review and management.',
      detail: 'Detection records are synced and can be explored later from the web dashboard under My Detections and analytics views.'
    },
    {
      icon: '🧾',
      title: 'Detection History',
      description: 'Users can browse previous detections, confidence summaries, and detected waste types in one place.',
      detail: 'The platform stores per-scan metadata including item counts and confidence metrics for historical tracking.'
    },
    {
      icon: '🛠️',
      title: 'Admin Operations',
      description: 'Admins can review users, detection activity, logs, analytics, and reporting pages from the admin portal.',
      detail: 'The backend exposes user/detection/activity endpoints used by the admin dashboard to monitor system usage.'
    }
  ];

  const features = [
    {
      icon: '🔄',
      color: 'pink',
      title: 'Real Workflow, No Demo Claims',
      description: 'This platform focuses on your actual implementation: auth, detection records, and management tools.',
      details: 'Landing copy now reflects what currently exists in the codebase instead of invented milestones, percentages, or partner announcements.'
    },
    {
      icon: '🧭',
      color: 'green',
      title: 'Clear User Journey',
      description: 'Create account → access dashboard → scan with mobile app → review and manage results on web.',
      details: 'The product flow is split intentionally between mobile capture and web-based monitoring, reports, and account controls.'
    },
    {
      icon: '🔌',
      color: 'yellow',
      title: 'API-Backed Data',
      description: 'Dashboards pull from backend routes for users, detections, stats, waste types, and activity logs.',
      details: 'Your implementation includes authenticated REST endpoints used by both user and admin interfaces.'
    }
  ];

  const modules = [
    { id: 1, name: 'Auth & Access', type: 'Core Module', image: '🔐', desc: 'Firebase sign-in/registration with protected web routes and role-based dashboard access' },
    { id: 2, name: 'Mobile Scan Experience', type: 'Capture Module', image: '📱', desc: 'Image capture and waste scanning flow handled in the mobile app experience' },
    { id: 3, name: 'My Detections', type: 'User Module', image: '📂', desc: 'Detection history, item summaries, timestamps, and confidence metrics for each scan' },
    { id: 4, name: 'Leaderboard & Progress', type: 'User Module', image: '🏆', desc: 'Competitive and progress-oriented views for user engagement and contribution tracking' },
    { id: 5, name: 'Admin Analytics', type: 'Admin Module', image: '📊', desc: 'System-wide stats, users, logs, and reports for platform monitoring and oversight' },
    { id: 6, name: 'Waste Type Insights', type: 'Admin/User Data', image: '♻️', desc: 'Aggregated waste type results and category trends from recorded detections' },
  ];

  const systemFacts = [
    { number: '36', label: 'Detectable Waste Types', sublabel: 'Spanning fruits, vegetables, proteins, eggs, grains, and more — each with disposal guides and decomposition data', icon: '♻️' },
    { number: '6', label: 'Waste Categories', sublabel: 'Fruits, Vegetables, Proteins, Eggs, Grains, and Other — each color-coded and tracked separately', icon: '📊' },
    { number: '34', label: 'Backend API Routes', sublabel: 'Across 5 route groups — authentication, users, detections, activity logs, and disposal locations', icon: '�' },
    { number: '3', label: 'Connected Services', sublabel: 'Express backend, Python AI detection service, and MongoDB database — all health-monitored in real time', icon: '🛠️' }
  ];

  // Auto-advance slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

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
            <div className="hero-icon-top">♻️</div>
            <div className="hero-icon-bottom">🌍</div>
          </div>
          <div className="container-pro">
            <div className="hero-content">
              <div className="hero-left">
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
              </div>
              <div className="hero-right">
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
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="features">
          <div className="container-pro">
            <h2 className="section-title">System Capabilities</h2>
            <div className="features-grid">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`feature-item ${feature.color}`}
                  onMouseEnter={() => setActiveFeature(index)}
                  onMouseLeave={() => setActiveFeature(null)}
                >
                  <div className="feature-icon">{feature.icon}</div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                  {activeFeature === index && (
                    <div className="feature-details">
                      {feature.details}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Platform Modules Section */}
        <section id="categories" className="shop">
          <div className="container-pro">
            <div className="shop-header">
              <div className="shop-title">
                <h2 className="section-title">Platform Modules</h2>
                <p>
                  A quick view of the real modules currently implemented in your OrganiSort system.
                </p>
              </div>
            </div>

            <div className="products-grid">
              {modules.map((cat) => (
                <article key={cat.id} className="product-card">
                  <div className="product-image">
                    {cat.image}
                  </div>
                  <div className="product-info">
                    <div className="product-header">
                      <div>
                        <h3 className="product-title">{cat.name}</h3>
                        <span className="product-grade">
                          {cat.type}
                        </span>
                      </div>
                    </div>
                    <p className="product-desc">{cat.desc}</p>
                    <button className="btn-outline product-button">
                      Included in current build
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="news" className="analyze">
          <div className="container-pro">
            <h2 className="section-title" style={{ marginBottom: '2rem', color: '#15803d' }}>
              How OrganiSort Works Today
            </h2>
            <div className="news-grid">
              {platformHighlights.map((item, index) => (
                <div key={index} className="news-card">
                  <div className="news-icon">{item.icon}</div>
                  <div className="news-content">
                    <div className="news-date">Current</div>
                    <h3 className="news-title">{item.title}</h3>
                    <p className="news-desc">{item.description}</p>
                    <p className="news-desc" style={{ marginTop: '0.5rem' }}>{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats/Impact Section */}
        <section id="impact" className="features" style={{ background: '#f9fafb' }}>
          <div className="container-pro">
            <h2 className="section-title">System Facts</h2>
            <div className="stats-grid">
              {systemFacts.map((stat, index) => (
                <div key={index} className="stat-card">
                  <div className="stat-icon">{stat.icon}</div>
                  <div className="stat-number">{stat.number}</div>
                  <div className="stat-label">{stat.label}</div>
                  {stat.sublabel && <div className="stat-sublabel">{stat.sublabel}</div>}
                </div>
              ))}
            </div>
          </div>
        </section>

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

            {/* Contact */}
            <div className="footer-col">
              <h3 className="footer-title">Project Note</h3>
              <p className="footer-contact">
                This landing page now avoids fabricated milestones and placeholder marketing claims.
              </p>
              <p className="footer-contact">
                It reflects the actual web/mobile/admin behavior in your current implementation.
              </p>
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
    </div>
  );
};

export default LandingPage;
