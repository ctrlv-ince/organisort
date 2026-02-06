import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Landing.css';

/**
 * Landing Page Component - OrganiSort
 * Main landing page for organic waste detection system
 * Updated with cleaner, professional design
 */
const LandingPage = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null);

  const slides = [
    {
      title: "Smart Waste Detection",
      subtitle: "AI-powered organic waste identification for a sustainable future",
      badge: "OrganiSort • Waste Management Innovation"
    },
    {
      title: "Real-Time Analytics",
      subtitle: "Track, monitor, and optimize your waste management processes",
      badge: "OrganiSort • Data-Driven Solutions"
    },
    {
      title: "Make a Difference",
      subtitle: "Join thousands contributing to environmental sustainability",
      badge: "OrganiSort • Community Impact"
    }
  ];

  const newsItems = [
    {
      icon: "🤖",
      title: "OrganiSort Launches AI-Powered Detection",
      description: "Our new machine learning model achieves 95% accuracy in identifying organic waste materials, setting a new industry standard.",
      date: "Feb 2026"
    },
    {
      icon: "👥",
      title: "10,000+ Users Join the Movement",
      description: "We've reached a milestone of 10,000 active users contributing to waste detection and environmental sustainability.",
      date: "Jan 2026"
    },
    {
      icon: "🤝",
      title: "Partnership with Environmental Organizations",
      description: "OrganiSort partners with leading environmental groups to expand waste management education and awareness.",
      date: "Dec 2025"
    },
    {
      icon: "📱",
      title: "Mobile App Now Available",
      description: "Download our mobile application for iOS and Android to detect waste on-the-go with improved camera integration.",
      date: "Nov 2025"
    },
    {
      icon: "📚",
      title: "New Waste Categories Added",
      description: "Expanded database now includes 50+ waste categories with detailed sorting guidelines and recycling information.",
      date: "Oct 2025"
    },
    {
      icon: "📊",
      title: "Community Impact Report 2026",
      description: "Our users have collectively identified over 1 million waste items, contributing to better recycling practices worldwide.",
      date: "Sep 2025"
    }
  ];

  const features = [
    {
      icon: "🤖",
      color: "pink",
      title: "AI-Powered Detection",
      description: "Advanced machine learning algorithms identify waste types with 95% accuracy in real-time.",
      details: "Our computer vision engine analyzes images using trained models to classify organic and inorganic waste materials instantly."
    },
    {
      icon: "📊",
      color: "green",
      title: "Analytics Dashboard",
      description: "Comprehensive insights into waste patterns, trends, and environmental impact metrics.",
      details: "Monitor your waste management efficiency with real-time dashboards, historical trends, and predictive analytics."
    },
    {
      icon: "🌍",
      color: "yellow",
      title: "Environmental Impact",
      description: "Track your contribution to sustainability with detailed carbon footprint reduction data.",
      details: "See exactly how your waste sorting efforts contribute to environmental conservation and carbon reduction goals."
    }
  ];

  const stats = [
    { number: "10,000+", label: "Active Users", icon: "👥" },
    { number: "1M+", label: "Waste Items Detected", icon: "🗑️" },
    { number: "95%", label: "AI Accuracy Rate", icon: "🎯" },
    { number: "50+", label: "Waste Categories", icon: "📋" }
  ];

  const wasteCategories = [
    { id: 1, name: 'Food Scraps', type: 'Compostable', image: '🍎', desc: 'Fruits, vegetables, and organic food waste' },
    { id: 2, name: 'Garden Waste', type: 'Compostable', image: '🌿', desc: 'Leaves, grass clippings, and plant materials' },
    { id: 3, name: 'Paper Products', type: 'Recyclable', image: '📄', desc: 'Clean paper, cardboard, and packaging' },
    { id: 4, name: 'Plastic Containers', type: 'Recyclable', image: '♻️', desc: 'Clean plastic bottles and containers' },
    { id: 5, name: 'Glass Items', type: 'Recyclable', image: '🫙', desc: 'Glass bottles and jars' },
    { id: 6, name: 'Mixed Waste', type: 'General', image: '🗑️', desc: 'Non-recyclable, non-compostable items' },
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
            <span className="logo-icon">♻️</span>
            <span className="logo-text">OrganiSort</span>
          </div>
          <nav className="desktop-nav">
            <a href="#home" className="nav-link">Home</a>
            <a href="#features" className="nav-link">Features</a>
            <a href="#categories" className="nav-link">Waste Categories</a>
            <a href="#news" className="nav-link">News</a>
            <a href="#impact" className="nav-link">Impact</a>
          </nav>
          <div className="header-right">
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
          </div>
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-menu-btn"
          >
            <span className="menu-icon">{mobileMenuOpen ? '✕' : '☰'}</span>
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <a href="#home" onClick={() => setMobileMenuOpen(false)}>Home</a>
          <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
          <a href="#categories" onClick={() => setMobileMenuOpen(false)}>Waste Categories</a>
          <a href="#news" onClick={() => setMobileMenuOpen(false)}>News</a>
          <a href="#impact" onClick={() => setMobileMenuOpen(false)}>Impact</a>
          <button onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}>Sign In</button>
          <button onClick={() => { navigate('/register'); setMobileMenuOpen(false); }}>Get Started</button>
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
                  AI-powered
                  <br />
                  <span className="hero-title-accent">{slides[currentSlide].title}</span>
                </h1>
                <p className="hero-desc">
                  {slides[currentSlide].subtitle}. Upload images or connect to live capture pipelines
                  and help build a more sustainable future through intelligent waste management.
                </p>
                <div className="hero-buttons">
                  <button
                    onClick={() => navigate('/register')}
                    className="btn-primary"
                  >
                    Start Detecting Waste
                  </button>
                  <a href="#features" className="hero-button-secondary">
                    Learn More
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
                  <div className="hero-fruit-display">♻️</div>
                  <div className="hero-price-badge">
                    <div className="hero-price-label">Detection Accuracy</div>
                    <div className="hero-price-value">95%</div>
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

        {/* Waste Categories Section */}
        <section id="categories" className="shop">
          <div className="container-pro">
            <div className="shop-header">
              <div className="shop-title">
                <h2 className="section-title">Waste Categories</h2>
                <p>
                  Explore the different types of waste our AI can identify and help you sort correctly.
                </p>
              </div>
            </div>

            <div className="products-grid">
              {wasteCategories.map(cat => (
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
                      View sorting guide
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* News Section */}
        <section id="news" className="analyze">
          <div className="container-pro">
            <h2 className="section-title" style={{ marginBottom: '2rem', color: '#15803d' }}>
              Latest News & Updates
            </h2>
            <div className="news-grid">
              {newsItems.map((item, index) => (
                <div key={index} className="news-card">
                  <div className="news-icon">{item.icon}</div>
                  <div className="news-content">
                    <div className="news-date">{item.date}</div>
                    <h3 className="news-title">{item.title}</h3>
                    <p className="news-desc">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats/Impact Section */}
        <section id="impact" className="features" style={{ background: '#f9fafb' }}>
          <div className="container-pro">
            <h2 className="section-title">Our Impact</h2>
            <div className="stats-grid">
              {stats.map((stat, index) => (
                <div key={index} className="stat-card">
                  <div className="stat-icon">{stat.icon}</div>
                  <div className="stat-number">{stat.number}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="container-pro">
            <div className="cta-content">
              <h2>Ready to Make a Difference?</h2>
              <p>Join thousands of users contributing to a more sustainable future through intelligent waste management.</p>
              <div className="cta-buttons">
                <button
                  onClick={() => navigate('/register')}
                  className="btn-primary btn-large"
                >
                  Get Started Free
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
      </main>

      {/* Footer */}
      <footer>
        <div className="container-pro">
          <div className="footer-grid">
            {/* About */}
            <div className="footer-col">
              <div className="footer-logo">♻️ OrganiSort</div>
              <p className="footer-desc">
                Organic Waste Detection & Management System.
                AI-powered solutions for sustainable waste management and environmental conservation.
              </p>
            </div>

            {/* Quick Links */}
            <div className="footer-col">
              <h3 className="footer-title">Quick Links</h3>
              <a href="#home" className="footer-link">Home</a>
              <a href="#features" className="footer-link">Features</a>
              <a href="#categories" className="footer-link">Waste Categories</a>
              <a href="#news" className="footer-link">News</a>
              <button onClick={() => navigate('/register')} className="footer-link">Sign Up</button>
            </div>

            {/* Resources */}
            <div className="footer-col">
              <h3 className="footer-title">Resources</h3>
              <a href="#guides" className="footer-link">User Guides</a>
              <a href="#faq" className="footer-link">FAQ</a>
              <a href="#api" className="footer-link">API Documentation</a>
              <a href="#blog" className="footer-link">Blog</a>
            </div>

            {/* Contact */}
            <div className="footer-col">
              <h3 className="footer-title">Contact</h3>
              <p className="footer-contact">
                <strong>Business Address:</strong><br />
                123 Green Street<br />
                Eco District<br />
                Metro Manila, Philippines
              </p>
              <p className="footer-contact">
                Email: info@organissort.com<br />
                Phone: +63 (2) 1234-5678
              </p>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-links">
              <a href="#privacy">Privacy Policy</a>
              <span>•</span>
              <a href="#terms">Terms of Service</a>
              <span>•</span>
              <a href="#contact">Contact</a>
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