import React from 'react';

const variantStyles = {
  primary: 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg focus:ring-green-500/30',
  info: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg focus:ring-blue-500/30',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg focus:ring-red-500/30',
  subtle: 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 shadow-sm focus:ring-gray-200',
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
    className={`inline-flex items-center justify-center rounded-xl px-6 py-3 font-bold transition-all duration-300 ease-out focus:outline-none focus:ring-4 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${variantStyles[variant] || variantStyles.primary} ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default PrimaryButton;
