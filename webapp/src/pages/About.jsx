import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../Landing.css';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      <header>
        <div className="container-pro">
          <div className="logo-section">
            <span className="logo-icon">♻️</span>
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
        <section className="hero">
          <div className="container-pro">
            <div className="hero-content" style={{ gridTemplateColumns: '1fr' }}>
              <div className="hero-left">
                <div className="hero-badge">About OrganiSort</div>
                <h1 className="hero-title">
                  Built for practical
                  <br />
                  <span className="hero-title-accent">organic waste detection workflows</span>
                </h1>
                <p className="hero-desc">
                  OrganiSort connects account-based access, mobile scanning, and role-based dashboards so users and admins can manage detection records in one unified platform.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="features">
          <div className="container-pro">
            <h2 className="section-title">What we focus on</h2>
            <div className="features-grid">
              <div className="feature-item green">
                <div className="feature-icon">📱</div>
                <h3>Mobile + Web Workflow</h3>
                <p>Capture and scan in mobile, then track and review results through the web portal.</p>
              </div>
              <div className="feature-item yellow">
                <div className="feature-icon">🔐</div>
                <h3>Protected Access</h3>
                <p>Role-aware authentication protects data and routes users to the right dashboard.</p>
              </div>
              <div className="feature-item pink">
                <div className="feature-icon">📊</div>
                <h3>Actionable Insights</h3>
                <p>Detection history, waste categories, and analytics help teams monitor real usage trends.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="container-pro">
            <div className="cta-content">
              <h2>Explore the platform</h2>
              <p>Go back to the landing page, read the contact page, or jump into your dashboard.</p>
              <div className="cta-buttons">
                <button onClick={() => navigate('/')} className="btn-outline btn-large">Back to Landing</button>
                <button onClick={() => navigate('/contact')} className="btn-primary btn-large">Contact Page</button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default About;
