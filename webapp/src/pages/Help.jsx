import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../Landing.css';

const helpCards = [
  {
    title: 'Account Access',
    description: 'Use the login page for returning users and register if you need a new OrganiSort account.',
  },
  {
    title: 'Dashboard Navigation',
    description: 'Users and admins are routed to role-specific dashboards after authentication.',
  },
  {
    title: 'Support Contact',
    description: 'If you encounter issues, use the contact page to reach support and technical help channels.',
  },
];

const Help = () => {
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
                <div className="hero-badge">Help Center</div>
                <h1 className="hero-title">
                  Find guidance for
                  <br />
                  <span className="hero-title-accent">common platform tasks</span>
                </h1>
                <p className="hero-desc">
                  Browse quick help topics for account management, dashboard usage, and support escalation.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="analyze">
          <div className="container-pro">
            <h2 className="section-title" style={{ marginBottom: '2rem', color: '#15803d' }}>Help Topics</h2>
            <div className="news-grid">
              {helpCards.map((item) => (
                <div key={item.title} className="news-card">
                  <div className="news-content">
                    <div className="news-date">Guide</div>
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

export default Help;
