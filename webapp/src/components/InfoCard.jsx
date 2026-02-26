import React from 'react';
import { cardBaseClass, semanticColorClasses } from './uiTheme';

const InfoCard = ({
  title,
  description,
  icon,
  tone = 'primary',
  className = '',
  titleClassName = '',
  children,
}) => {
  const toneClasses = semanticColorClasses[tone] || semanticColorClasses.primary;

  return (
    <div
      className={`${cardBaseClass} p-6 ${className}`}
      style={{
        background: 'var(--theme-card, #ffffff)',
        borderColor: 'var(--theme-card-border, #f0f0f0)',
      }}
    >
      {(icon || title || description) && (
        <div className="mb-4 flex items-start gap-3">
          {icon && (
            <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl ${toneClasses.icon}`}>
              {icon}
            </div>
          )}
          <div>
            {title && <h3 className={`text-lg font-bold ${titleClassName}`} style={{ color: 'var(--theme-text, #111827)' }}>{title}</h3>}
            {description && <p className="mt-1 text-sm" style={{ color: 'var(--theme-text-secondary, #6b7280)' }}>{description}</p>}
          </div>
        </div>
      )}
      {children}
    </div>
  );
};

export default InfoCard;
