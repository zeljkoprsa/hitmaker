import React, { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'light' | 'dark' | 'primary';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'light', 
  size = 'small',
  className = '' 
}) => {
  const variantClasses = {
    light: 'bg-white text-useless-dark',
    dark: 'bg-[#242424] text-white',
    primary: 'bg-gray-800 text-white',
  };

  const sizeClasses = {
    small: 'px-3 py-1 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-5 py-2.5 text-lg',
  };

  return (
    <span className={`${variantClasses[variant]} ${sizeClasses[size]} rounded-full inline-block ${className}`}>
      {children}
    </span>
  );
};

export default Badge;

