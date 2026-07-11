import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  hoverable?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  id,
  hoverable = false,
}) => {
  // Check if custom padding classes are provided in className
  const hasCustomPadding = className.split(' ').some(c => 
    c.startsWith('p-') || 
    c.startsWith('px-') || 
    c.startsWith('py-') || 
    c.startsWith('pt-') || 
    c.startsWith('pb-') || 
    c.startsWith('pl-') || 
    c.startsWith('pr-')
  );

  return (
    <div
      id={id}
      className={`glass-card rounded-3xl shadow-lg text-slate-800 transform-gpu overflow-hidden ${
        hasCustomPadding ? '' : 'p-6'
      } ${
        hoverable ? 'glass-card-hover' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
