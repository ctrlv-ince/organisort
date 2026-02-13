import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../Landing.css';

const privacyCards = [
  {
    title: 'Data Collection',
    description: 'We collect account and detection data required to provide routing, dashboards, and reporting.',
  },
  {
    title: 'Data Security',
    description: 'Role-based access and authenticated APIs are used to protect your information.',
  },
  {
    title: 'Data Control',
    description: 'You can request data export or deletion options through account settings and support channels.',
  },
];

const Privacy = () => {
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
                <div className="hero-badge">Privacy Policy</div>
                <h1 className="hero-title">
                  Understand how
                  <br />
                  <span className="hero-title-accent">your data is handled</span>
                </h1>
                <p className="hero-desc">
                  This policy describes what OrganiSort stores, how it is used, and the controls available to users.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="analyze">
          <div className="container-pro">
            <h2 className="section-title" style={{ marginBottom: '2rem', color: '#15803d' }}>Privacy Highlights</h2>
            <div className="news-grid">
              {privacyCards.map((item) => (
                <div key={item.title} className="news-card">
                  <div className="news-content">
                    <div className="news-date">Privacy</div>
                    <h3 className="news-title">{item.title}</h3>
                    <p className="news-desc">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Privacy;
