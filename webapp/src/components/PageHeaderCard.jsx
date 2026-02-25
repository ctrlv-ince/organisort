import React from 'react';

const variantClasses = {
  primary: 'bg-green-50/50 border border-green-100 text-green-900',
  success: 'bg-emerald-50/50 border border-emerald-100 text-emerald-900',
  info: 'bg-blue-50/50 border border-blue-100 text-blue-900',
  warn: 'bg-amber-50/50 border border-amber-100 text-amber-900',
  danger: 'bg-red-50/50 border border-red-100 text-red-900',
};

const iconColors = {
  primary: 'text-green-600 bg-green-100',
  success: 'text-emerald-600 bg-emerald-100',
  info: 'text-blue-600 bg-blue-100',
  warn: 'text-amber-600 bg-amber-100',
  danger: 'text-red-600 bg-red-100',
};

const PageHeaderCard = ({ title, subtitle, icon, variant = 'primary' }) => (
  <div className={`rounded-[2rem] p-8 shadow-sm backdrop-blur-md transition-all duration-300 ${variantClasses[variant] || variantClasses.primary}`}>
    <h1 className="mb-3 flex items-center text-3xl font-extrabold tracking-tight">
      {icon && <span className={`mr-4 inline-flex p-3 rounded-2xl ${iconColors[variant] || iconColors.primary}`}>{icon}</span>}
      {title}
    </h1>
    {subtitle && <p className="text-lg text-gray-600 font-medium ml-1">{subtitle}</p>}
  </div>
);

export default PageHeaderCard;
