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
    <div className={`${cardBaseClass} p-6 ${className}`}>
      {(icon || title || description) && (
        <div className="mb-4 flex items-start gap-3">
          {icon && (
            <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full ${toneClasses.icon}`}>
              {icon}
            </div>
          )}
          <div>
            {title && <h3 className={`text-lg font-bold text-gray-800 ${titleClassName}`}>{title}</h3>}
            {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
          </div>
        </div>
      )}
      {children}
    </div>
  );
};

export default InfoCard;
