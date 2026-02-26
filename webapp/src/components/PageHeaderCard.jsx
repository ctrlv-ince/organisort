import React from 'react';

const PageHeaderCard = ({ title, subtitle, icon, variant = 'primary' }) => {
  return (
    <div
      className="rounded-[2.5rem] p-8 shadow-sm backdrop-blur-xl transition-all duration-300"
      style={{
        background: 'var(--theme-accent-surface, #f0fdf4)',
        border: '1px solid var(--theme-accent-surface-border, #bbf7d0)',
        color: 'var(--theme-text, #111827)',
      }}
    >
      <h1
        className="mb-3 flex items-center text-3xl font-extrabold tracking-tighter"
        style={{ color: 'var(--theme-text, #111827)' }}
      >
        {icon && (
          <span
            className="mr-4 inline-flex p-3 rounded-2xl"
            style={{
              color: 'var(--theme-accent, #15803d)',
              background: 'var(--theme-accent-surface, #f0fdf4)',
            }}
          >
            {icon}
          </span>
        )}
        {title}
      </h1>
      {subtitle && (
        <p
          className="text-base font-medium ml-1"
          style={{ color: 'var(--theme-text-secondary, #6b7280)' }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default PageHeaderCard;
