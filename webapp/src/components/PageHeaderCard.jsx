import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useParallax } from '../hooks/useParallax';

const PageHeaderCard = ({ title, subtitle, icon, variant = 'primary' }) => {
  const containerRef = useRef(null);
  const { y: cardY } = useParallax({ speed: 0.12, ref: containerRef });
  const { y: blobY } = useParallax({ speed: 0.3, ref: containerRef });

  return (
    <div ref={containerRef}>
      <motion.div
        className="rounded-[2.5rem] p-8 shadow-sm backdrop-blur-xl transition-all duration-300 overflow-hidden relative"
        style={{
          background: 'var(--theme-accent-surface, #f0fdf4)',
          border: '1px solid var(--theme-accent-surface-border, #bbf7d0)',
          color: 'var(--theme-text, #111827)',
          y: cardY,
        }}
      >
        {/* Decorative background blob that drifts at a different rate for depth */}
        <motion.div
          className="absolute -right-16 -top-16 w-48 h-48 rounded-full opacity-[0.07] blur-2xl pointer-events-none"
          style={{
            background: 'var(--theme-accent, #15803d)',
            y: blobY,
          }}
        />
        <h1
          className="mb-3 flex items-center text-3xl font-extrabold tracking-tighter relative z-10"
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
            className="text-base font-medium ml-1 relative z-10"
            style={{ color: 'var(--theme-text-secondary, #6b7280)' }}
          >
            {subtitle}
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default PageHeaderCard;
