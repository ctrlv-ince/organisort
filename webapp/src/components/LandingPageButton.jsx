import React from 'react';
import { useNavigate } from 'react-router-dom';

const COPY_LABEL = 'Landing Page';

const CLASS_TOKENS = {
  base: 'inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 font-semibold',
  icon: 'w-4 h-4',
  navbar: 'px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 text-sm',
  sidebar: 'w-full px-4 py-3 bg-white/10 hover:bg-white/20 text-white',
};

const LandingPageButton = ({ variant = 'navbar', className = '' }) => {
  const navigate = useNavigate();

  const variantClasses = CLASS_TOKENS[variant] || CLASS_TOKENS.navbar;

  return (
    <button
      onClick={() => navigate('/')}
      className={`${CLASS_TOKENS.base} ${variantClasses} ${className}`.trim()}
      aria-label={COPY_LABEL}
    >
      <svg className={CLASS_TOKENS.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9.75L12 4l9 5.75V20a1 1 0 01-1 1h-5.5a.5.5 0 01-.5-.5V15a2 2 0 00-2-2h0a2 2 0 00-2 2v5.5a.5.5 0 01-.5.5H4a1 1 0 01-1-1V9.75z" />
      </svg>
      <span>{COPY_LABEL}</span>
    </button>
  );
};

export default LandingPageButton;
