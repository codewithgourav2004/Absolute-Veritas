import React from 'react';

const variants = {
  primary: 'bg-crimson text-white hover:bg-red-700',
  outline: 'border-2 border-crimson text-crimson hover:bg-crimson hover:text-white',
  white: 'bg-white text-indigo hover:bg-pearl',
  ghost: 'text-crimson hover:bg-red-50',
};

const Button = ({ children, variant = 'primary', className = '', onClick, type = 'button', disabled }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`px-6 py-3 rounded-lg font-semibold transition-colors duration-200 inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
  >
    {children}
  </button>
);

export default Button;
