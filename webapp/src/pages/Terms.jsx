import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../Landing.css';

const termsCards = [
  {
    title: 'Acceptable Use',
    description: 'Use OrganiSort only for lawful waste detection, reporting, and dashboard management activities.',
  },
  {
    title: 'Account Responsibility',
    description: 'You are responsible for account credentials and all activity performed under your account.',
  },
  {
    title: 'Service Updates',
    description: 'Features may evolve over time to improve system performance, reliability, and user experience.',
  },
];

const Terms = () => {
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
                <div className="hero-badge">Terms of Service</div>
                <h1 className="hero-title">
                  Platform terms for
                  <br />
                  <span className="hero-title-accent">responsible usage</span>
                </h1>
                <p className="hero-desc">
                  These terms explain your responsibilities while using OrganiSort features, accounts, and reporting workflows.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="analyze">
          <div className="container-pro">
            <h2 className="section-title" style={{ marginBottom: '2rem', color: '#15803d' }}>Key Terms</h2>
            <div className="news-grid">
              {termsCards.map((item) => (
                <div key={item.title} className="news-card">
                  <div className="news-content">
                    <div className="news-date">Policy</div>
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

export default Terms;
