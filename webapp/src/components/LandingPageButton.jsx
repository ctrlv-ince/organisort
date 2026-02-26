import React from 'react';
import { useNavigate } from 'react-router-dom';

const COPY_LABEL = 'Landing Page';

const LandingPageButton = ({ variant = 'navbar', className = '' }) => {
  const navigate = useNavigate();

  const baseClass = 'inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 font-semibold';
  const iconClass = 'w-4 h-4';

  const isSidebar = variant === 'sidebar';

  return (
    <button
      onClick={() => navigate('/')}
      className={`${baseClass} ${isSidebar ? 'w-full px-4 py-3' : 'px-4 py-2 text-sm'} ${className}`.trim()}
      style={isSidebar ? {
        background: 'var(--theme-accent-surface, rgba(255,255,255,0.1))',
        color: 'var(--theme-text, white)',
        border: '1px solid var(--theme-accent-surface-border, rgba(255,255,255,0.15))',
      } : {
        background: 'var(--theme-accent-surface, #f0fdf4)',
        color: 'var(--theme-accent, #15803d)',
      }}
      aria-label={COPY_LABEL}
    >
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9.75L12 4l9 5.75V20a1 1 0 01-1 1h-5.5a.5.5 0 01-.5-.5V15a2 2 0 00-2-2h0a2 2 0 00-2 2v5.5a.5.5 0 01-.5.5H4a1 1 0 01-1-1V9.75z" />
      </svg>
      <span>{COPY_LABEL}</span>
    </button>
  );
};

export default LandingPageButton;

