import React from 'react';

const variantClasses = {
  primary: 'from-primary to-primary/80 text-white',
  success: 'from-success to-success/80 text-white',
  info: 'from-info to-info/80 text-white',
  warn: 'from-warn to-warn/80 text-white',
  danger: 'from-danger to-danger/80 text-white',
};

const PageHeaderCard = ({ title, subtitle, icon, variant = 'primary' }) => (
  <div className={`rounded-xl bg-gradient-to-r p-6 shadow-lg ${variantClasses[variant] || variantClasses.primary}`}>
    <h1 className="mb-2 flex items-center text-3xl font-bold">
      {icon && <span className="mr-3 inline-flex">{icon}</span>}
      {title}
    </h1>
    {subtitle && <p className="text-sm text-white/85 sm:text-base">{subtitle}</p>}
  </div>
);

export default PageHeaderCard;
