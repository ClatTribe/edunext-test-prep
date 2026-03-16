import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  children, 
  style,
  ...props 
}) => {
  const accentColor = '#F59E0B';
  const primaryBg = '#050818';
  
  const baseStyles = "inline-flex items-center justify-center font-bold rounded-lg transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";
  
  const variants = {
    primary: "border border-transparent hover:brightness-110",
    secondary: "bg-white hover:bg-gray-100 border border-transparent",
    outline: "bg-transparent border hover:bg-white/5"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  const getVariantStyles = () => {
    switch(variant) {
      case 'primary':
        return {
          backgroundColor: accentColor,
          color: primaryBg,
          boxShadow: `0 4px 15px rgba(245, 158, 11, 0.2)`,
        };
      case 'secondary':
        return {
          backgroundColor: 'white',
          color: primaryBg,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: accentColor,
          borderColor: 'rgba(245, 158, 11, 0.5)',
        };
      default:
        return {};
    }
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      style={{ ...getVariantStyles(), ...style }}
      {...props}
    >
      {children}
    </button>
  );
};