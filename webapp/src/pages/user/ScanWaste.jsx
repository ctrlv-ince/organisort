import React from 'react';
import { motion } from 'framer-motion';
import InfoCard from '../../components/InfoCard';
import PageHeaderCard from '../../components/PageHeaderCard';
import { semanticColorClasses } from '../../components/uiTheme';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

/**
 * ScanWaste Page - WEB VERSION
 * Informs users that scanning is only available on mobile
 */
const ScanWaste = () => {
  const featureCards = [
    {
      title: 'Real-Time Camera Scanning',
      description: 'Point your camera at waste and get instant AI-powered classification',
      tone: 'primary',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        </svg>
      ),
    },
    {
      title: 'Upload from Gallery',
      description: "Upload existing photos from your phone's gallery for analysis",
      tone: 'info',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
    },
    {
      title: '45 Waste Types',
      description: 'Advanced AI detects 45 specific organic waste types with high accuracy',
      tone: 'success',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      title: 'Instant Results',
      description: 'Get detection results in seconds with confidence scores and waste type details',
      tone: 'warn',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
  ];

  return (
    <motion.div
      className="p-6 md:p-10 max-w-5xl mx-auto space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <PageHeaderCard
          title="Mobile App Required"
          subtitle="Waste scanning is available exclusively on our mobile app"
          variant="info"
          icon={(
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          )}
        />
      </motion.div>

      {/* Mobile App Info */}
      <motion.div variants={itemVariants}>
        <InfoCard className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full mb-6 bg-primary/10">
              <svg className="w-16 h-16" fill="none" stroke="var(--theme-accent, #15803d)" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--theme-text, #111827)' }}>
              Download OrganiSort Mobile
            </h2>
            <p className="max-w-2xl mx-auto" style={{ color: 'var(--theme-text-secondary, #6b7280)' }}>
              Our AI-powered waste detection uses your device's camera for real-time scanning.
              Download the mobile app to start detecting organic waste on the go!
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {featureCards.map((feature) => (
              <div key={feature.title} className={`flex items-start space-x-4 rounded-lg p-4 ${semanticColorClasses[feature.tone].soft}`}>
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${semanticColorClasses[feature.tone].icon}`}>
                    {feature.icon}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold mb-1" style={{ color: 'var(--theme-text, #111827)' }}>{feature.title}</h3>
                  <p className="text-sm" style={{ color: 'var(--theme-text-secondary, #6b7280)' }}>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Download Links */}
          <div className="pt-8" style={{ borderTop: '1px solid var(--theme-border, #e5e7eb)' }}>
            <h3 className="text-xl font-bold mb-4 text-center" style={{ color: 'var(--theme-text, #111827)' }}>
              Download Now
            </h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#"
                className="flex items-center justify-center space-x-3 rounded-lg bg-black px-6 py-3 text-white transition hover:bg-gray-800"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                <div className="text-left">
                  <div className="text-xs">Download on the</div>
                  <div className="text-lg font-semibold">App Store</div>
                </div>
              </a>

              <a
                href="#"
                className="flex items-center justify-center space-x-3 rounded-lg bg-black px-6 py-3 text-white transition hover:bg-gray-800"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.802 8.99l-2.303 2.303-8.635-8.635z" />
                </svg>
                <div className="text-left">
                  <div className="text-xs">GET IT ON</div>
                  <div className="text-lg font-semibold">Google Play</div>
                </div>
              </a>
            </div>
            <p className="text-center text-sm mt-4" style={{ color: 'var(--theme-text-secondary, #6b7280)' }}>
              Coming soon to iOS and Android
            </p>
          </div>
        </InfoCard>
      </motion.div>

      {/* Web Features Card */}
      <motion.div variants={itemVariants}>
        <InfoCard className="border-primary/30 bg-primary/5">
          <h3 className="text-xl font-bold text-primary mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            What You Can Do on Web
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="flex items-start">
              <span className="text-primary mr-2 mt-1">✓</span>
              <p className="text-primary text-sm font-medium">View all your detection history and results</p>
            </div>
            <div className="flex items-start">
              <span className="text-primary mr-2 mt-1">✓</span>
              <p className="text-primary text-sm font-medium">Track your achievements and progress</p>
            </div>
            <div className="flex items-start">
              <span className="text-primary mr-2 mt-1">✓</span>
              <p className="text-primary text-sm font-medium">Compete on the leaderboard with other users</p>
            </div>
            <div className="flex items-start">
              <span className="text-primary mr-2 mt-1">✓</span>
              <p className="text-primary text-sm font-medium">Manage your profile and settings</p>
            </div>
          </div>
        </InfoCard>
      </motion.div>

      {/* FAQ Section */}
      <motion.div variants={itemVariants}>
        <InfoCard>
          <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--theme-text, #111827)' }}>Frequently Asked Questions</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2" style={{ color: 'var(--theme-text, #111827)' }}>Why can't I scan on the website?</h4>
              <p className="text-sm" style={{ color: 'var(--theme-text-secondary, #6b7280)' }}>
                Our AI waste detection requires camera access and works best on mobile devices.
                The mobile app provides optimized performance and a better user experience for real-time scanning.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2" style={{ color: 'var(--theme-text, #111827)' }}>Is the mobile app free?</h4>
              <p className="text-sm" style={{ color: 'var(--theme-text-secondary, #6b7280)' }}>
                Yes! The OrganiSort mobile app is completely free to download and use.
                All detection features are included at no cost.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2" style={{ color: 'var(--theme-text, #111827)' }}>Will my scans sync to the web?</h4>
              <p className="text-sm" style={{ color: 'var(--theme-text-secondary, #6b7280)' }}>
                Absolutely! All scans made on the mobile app automatically sync to your account,
                so you can view your history and stats on both mobile and web.
              </p>
            </div>
          </div>
        </InfoCard>
      </motion.div>
    </motion.div>
  );
};

export default ScanWaste;
