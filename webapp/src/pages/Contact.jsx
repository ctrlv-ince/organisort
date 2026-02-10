import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../Landing.css';

const contactCards = [
  { icon: '📧', title: 'Email', value: 'organisort.support@example.com', description: 'For feature requests, onboarding, and account concerns.' },
  { icon: '💬', title: 'General Inquiries', value: 'Mon - Fri, 9:00 AM - 5:00 PM', description: 'Questions about app usage, workflows, and reporting.' },
  { icon: '🛠️', title: 'Technical Help', value: 'Dashboard + API support', description: 'Troubleshooting authentication, scans, and detection history.' },
];

const Contact = () => {
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
                <div className="hero-badge">Contact OrganiSort</div>
                <h1 className="hero-title">
                  We’re here to help
                  <br />
                  <span className="hero-title-accent">with your platform usage</span>
                </h1>
                <p className="hero-desc">
                  Reach out for support with authentication, dashboard access, and detection workflow concerns.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="analyze">
          <div className="container-pro">
            <h2 className="section-title" style={{ marginBottom: '2rem', color: '#15803d' }}>Contact Channels</h2>
            <div className="news-grid">
              {contactCards.map((item) => (
                <div key={item.title} className="news-card">
                  <div className="news-icon">{item.icon}</div>
                  <div className="news-content">
                    <div className="news-date">{item.title}</div>
                    <h3 className="news-title">{item.value}</h3>
                    <p className="news-desc">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="container-pro">
            <div className="cta-content">
              <h2>Need a quick route?</h2>
              <p>Jump back to landing, learn more about OrganiSort, or continue to your dashboard.</p>
              <div className="cta-buttons">
                <button onClick={() => navigate('/')} className="btn-outline btn-large">Back to Landing</button>
                <button onClick={() => navigate('/about')} className="btn-primary btn-large">About Page</button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Contact;
