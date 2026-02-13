import React from 'react';

const variantStyles = {
  primary: 'bg-primary hover:bg-primary/90 text-white focus:ring-primary/30',
  info: 'bg-info hover:bg-info/90 text-white focus:ring-info/30',
  danger: 'bg-danger hover:bg-danger/90 text-white focus:ring-danger/30',
  subtle: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-200',
};

const PrimaryButton = ({
  children,
  className = '',
  variant = 'primary',
  disabled = false,
  type = 'button',
  ...props
}) => (
  <button
    type={type}
    disabled={disabled}
    className={`inline-flex items-center justify-center rounded-lg px-5 py-2.5 font-semibold transition-all duration-200 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:bg-gray-400 ${variantStyles[variant] || variantStyles.primary} ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default PrimaryButton;
