import React, { ReactNode } from 'react';

interface SectionProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  spacing?: 'none' | 'small' | 'medium' | 'large';
}

const Section = ({ 
  children, 
  title, 
  subtitle, 
  className = '', 
  spacing = 'medium' 
}: SectionProps) => {
  const spacingClasses = {
    none: '',
    small: 'space-y-6',
    medium: 'space-y-12',
    large: 'space-y-32',
  };

  return (
    <section className={`${spacingClasses[spacing]} ${className}`}>
      {(title || subtitle) && (
        <div className="text-center space-y-2">
          {title && <h2 className="text-2xl font-display text-white">{title}</h2>}
          {subtitle && <p className="text-base text-gray-400">{subtitle}</p>}
        </div>
      )}
      {children}
    </section>
  );
};

export default Section;

