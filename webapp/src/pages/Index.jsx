import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Landing Page Component - OrganiSort
 * Main landing page for organic waste detection system
 * UCAP green/brown theme
 */
const LandingPage = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const slides = [
    {
      title: "Smart Waste Detection",
      subtitle: "AI-powered organic waste identification for a sustainable future",
      gradient: "from-green-700 to-amber-700"
    },
    {
      title: "Real-Time Analytics",
      subtitle: "Track, monitor, and optimize your waste management processes",
      gradient: "from-green-600 to-green-800"
    },
    {
      title: "Make a Difference",
      subtitle: "Join thousands contributing to environmental sustainability",
      gradient: "from-emerald-600 to-emerald-800"
    }
  ];

  const newsItems = [
    {
      title: "OrganiSort Launches AI-Powered Detection",
      description: "Our new machine learning model achieves 95% accuracy in identifying organic waste materials, setting a new industry standard...",
      link: "#"
    },
    {
      title: "10,000+ Users Join the Movement",
      description: "We've reached a milestone of 10,000 active users contributing to waste detection and environmental sustainability...",
      link: "#"
    },
    {
      title: "Partnership with Environmental Organizations",
      description: "OrganiSort partners with leading environmental groups to expand waste management education and awareness...",
      link: "#"
    },
    {
      title: "Mobile App Now Available",
      description: "Download our mobile application for iOS and Android to detect waste on-the-go with improved camera integration...",
      link: "#"
    },
    {
      title: "New Waste Categories Added",
      description: "Expanded database now includes 50+ waste categories with detailed sorting guidelines and recycling information...",
      link: "#"
    },
    {
      title: "Community Impact Report 2026",
      description: "Our users have collectively identified over 1 million waste items, contributing to better recycling practices worldwide...",
      link: "#"
    }
  ];

  const features = [
    {
      icon: "🤖",
      title: "AI-Powered Detection",
      description: "Advanced machine learning algorithms identify waste types with 95% accuracy in real-time.",
      link: "#ai-detection"
    },
    {
      icon: "📊",
      title: "Analytics Dashboard",
      description: "Comprehensive insights into waste patterns, trends, and environmental impact metrics.",
      link: "#analytics"
    },
    {
      icon: "🌍",
      title: "Environmental Impact",
      description: "Track your contribution to sustainability with detailed carbon footprint reduction data.",
      link: "#impact"
    },
    {
      icon: "📱",
      title: "Mobile Integration",
      description: "Seamless mobile app experience for iOS and Android with offline detection capabilities.",
      link: "#mobile"
    }
  ];

  const stats = [
    { number: "10,000+", label: "Active Users" },
    { number: "1M+", label: "Waste Items Detected" },
    { number: "95%", label: "AI Accuracy Rate" },
    { number: "50+", label: "Waste Categories" }
  ];

  // Auto-advance slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b-4 border-green-700 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Logo */}
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-800 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-3xl">♻️</span>
              </div>
              {/* Title */}
              <div>
                <h1 className="text-3xl font-bold text-green-800">OrganiSort</h1>
                <p className="text-sm text-gray-600">Organic Waste Detection & Management System</p>
              </div>
            </div>
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-green-700 hover:text-green-800"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-green-700 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="hidden md:flex space-x-1">
            <a href="#home" className="text-white px-4 py-3 hover:bg-green-800 transition-colors">Home</a>
            <div className="relative group">
              <a href="#about" className="text-white px-4 py-3 hover:bg-green-800 transition-colors inline-flex items-center">
                About Us
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </a>
              <div className="absolute left-0 mt-0 w-56 bg-green-700 shadow-lg hidden group-hover:block">
                <a href="#about-organissort" className="block px-4 py-2 text-white hover:bg-green-800 border-b border-green-600">About OrganiSort</a>
                <a href="#our-mission" className="block px-4 py-2 text-white hover:bg-green-800 border-b border-green-600">Our Mission</a>
                <a href="#our-team" className="block px-4 py-2 text-white hover:bg-green-800">Our Team</a>
              </div>
            </div>
            <div className="relative group">
              <a href="#features" className="text-white px-4 py-3 hover:bg-green-800 transition-colors inline-flex items-center">
                Features
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </a>
              <div className="absolute left-0 mt-0 w-56 bg-green-700 shadow-lg hidden group-hover:block">
                <a href="#ai-detection" className="block px-4 py-2 text-white hover:bg-green-800 border-b border-green-600">AI Detection</a>
                <a href="#waste-categories" className="block px-4 py-2 text-white hover:bg-green-800 border-b border-green-600">Waste Categories</a>
                <a href="#analytics" className="block px-4 py-2 text-white hover:bg-green-800">Analytics Dashboard</a>
              </div>
            </div>
            <a href="#how-it-works" className="text-white px-4 py-3 hover:bg-green-800 transition-colors">How It Works</a>
            <a href="#news" className="text-white px-4 py-3 hover:bg-green-800 transition-colors">News</a>
            <a href="#contact" className="text-white px-4 py-3 hover:bg-green-800 transition-colors">Contact</a>
            <button
              onClick={() => navigate('/login')}
              className="text-white px-4 py-3 hover:bg-green-800 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="text-white px-4 py-3 hover:bg-green-800 transition-colors"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-2">
              <a href="#home" className="block text-white px-4 py-2 hover:bg-green-800">Home</a>
              <a href="#about" className="block text-white px-4 py-2 hover:bg-green-800">About Us</a>
              <a href="#features" className="block text-white px-4 py-2 hover:bg-green-800">Features</a>
              <a href="#news" className="block text-white px-4 py-2 hover:bg-green-800">News</a>
              <a href="#contact" className="block text-white px-4 py-2 hover:bg-green-800">Contact</a>
              <button
                onClick={() => navigate('/register')}
                className="block w-full text-left text-white px-4 py-2 hover:bg-green-800"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Banner Slider */}
      <section className="relative h-96 md:h-[500px] overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className={`w-full h-full bg-gradient-to-r ${slide.gradient} flex items-center justify-center`}>
              <div className="text-center text-white px-4 relative z-10">
                <h2 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">{slide.title}</h2>
                <p className="text-xl md:text-2xl drop-shadow-md">{slide.subtitle}</p>
              </div>
              {/* Decorative Element */}
              <div className="absolute top-0 right-0 text-9xl opacity-10">♻️</div>
            </div>
          </div>
        ))}
        
        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-white w-8' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Quick Links */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <a href="#features" className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-4 px-6 rounded-lg shadow-md hover:shadow-lg transition-all text-center">
              🔍 Explore Features
            </a>
            <a href="#how-it-works" className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-4 px-6 rounded-lg shadow-md hover:shadow-lg transition-all text-center">
              📖 How It Works
            </a>
            <a href="#get-started" className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-4 px-6 rounded-lg shadow-md hover:shadow-lg transition-all text-center">
              🚀 Get Started
            </a>
            <button
              onClick={() => navigate('/register')}
              className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold py-4 px-6 rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              ✨ Sign Up Free
            </button>
            <a href="#contact" className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-4 px-6 rounded-lg shadow-md hover:shadow-lg transition-all text-center">
              📧 Contact Us
            </a>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section id="news" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-4xl font-bold text-green-800 mb-8 pb-4 border-b-4 border-amber-600">
          Latest News & Updates
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsItems.map((item, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 border-l-4 border-l-green-600 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-bold text-green-700 mb-3">{item.title}</h3>
              <p className="text-gray-600 mb-4">{item.description}</p>
              <a href={item.link} className="text-amber-600 font-semibold hover:underline">
                Read more &gt;
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-green-800 mb-8 pb-4 border-b-4 border-amber-600">
            Key Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="bg-gradient-to-br from-green-600 to-green-800 h-48 flex items-center justify-center text-6xl">
                  {feature.icon}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-green-700 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <a
                    href={feature.link}
                    className="inline-block bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all"
                  >
                    Learn More
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-4xl font-bold text-green-800 mb-8 pb-4 border-b-4 border-amber-600">
          Our Impact
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-green-600 to-green-800 text-white rounded-lg p-8 text-center shadow-lg"
            >
              <div className="text-5xl font-bold mb-2">{stat.number}</div>
              <div className="text-lg opacity-90">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Contact */}
            <div>
              <h3 className="text-xl font-bold mb-4">CONTACT</h3>
              <p className="mb-2"><strong>Business Address:</strong></p>
              <p className="text-green-100 mb-2">
                123 Green Street<br />
                Eco District<br />
                Metro Manila, Philippines
              </p>
              <p className="text-green-100">Email: info@organissort.com</p>
              <p className="text-green-100">Phone: +63 (2) 1234-5678</p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <a href="#about" className="block text-green-100 hover:text-white mb-2">About OrganiSort</a>
              <a href="#features" className="block text-green-100 hover:text-white mb-2">Features</a>
              <a href="#how-it-works" className="block text-green-100 hover:text-white mb-2">How It Works</a>
              <a href="#news" className="block text-green-100 hover:text-white mb-2">News & Updates</a>
              <button onClick={() => navigate('/register')} className="block text-green-100 hover:text-white mb-2">Sign Up</button>
              <button onClick={() => navigate('/login')} className="block text-green-100 hover:text-white">Sign In</button>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-xl font-bold mb-4">Resources</h3>
              <a href="#guides" className="block text-green-100 hover:text-white mb-2">User Guides</a>
              <a href="#faq" className="block text-green-100 hover:text-white mb-2">FAQ</a>
              <a href="#api-docs" className="block text-green-100 hover:text-white mb-2">API Documentation</a>
              <a href="#waste-categories" className="block text-green-100 hover:text-white mb-2">Waste Categories</a>
              <a href="#blog" className="block text-green-100 hover:text-white">Blog</a>
            </div>

            {/* Follow Us */}
            <div>
              <h3 className="text-xl font-bold mb-4">FOLLOW US</h3>
              <div className="flex space-x-3 mb-6">
                <a href="#" className="w-10 h-10 bg-amber-600 hover:bg-amber-700 rounded-full flex items-center justify-center transition-colors">
                  <span className="font-bold">f</span>
                </a>
                <a href="#" className="w-10 h-10 bg-amber-600 hover:bg-amber-700 rounded-full flex items-center justify-center transition-colors">
                  <span className="font-bold">t</span>
                </a>
                <a href="#" className="w-10 h-10 bg-amber-600 hover:bg-amber-700 rounded-full flex items-center justify-center transition-colors">
                  <span className="font-bold">in</span>
                </a>
                <a href="#" className="w-10 h-10 bg-amber-600 hover:bg-amber-700 rounded-full flex items-center justify-center transition-colors">
                  <span className="font-bold">ig</span>
                </a>
              </div>
              <p className="font-bold mb-2">Newsletter</p>
              <p className="text-green-100 text-sm">Subscribe for updates on waste management and sustainability.</p>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t border-green-600 mt-8 pt-8 text-center text-green-100">
            <p>&copy; 2026 OrganiSort. All rights reserved.</p>
            <div className="mt-2 space-x-4 text-sm">
              <a href="#privacy" className="hover:text-white">Privacy Policy</a>
              <span>|</span>
              <a href="#terms" className="hover:text-white">Terms of Service</a>
              <span>|</span>
              <a href="#contact" className="hover:text-white">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;