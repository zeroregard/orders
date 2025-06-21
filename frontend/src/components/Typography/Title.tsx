import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface TitleProps {
  children: React.ReactNode;
  icon?: LucideIcon;
  variant?: 'page' | 'section';
  className?: string;
}

export function Title({
  children,
  icon: Icon,
  variant = 'section',
  className = ''
}: TitleProps) {
  const baseClasses = 'font-medium flex items-center gap-3';
  
  const variantClasses = {
    page: 'text-xl text-white',
    section: 'text-lg text-gray-200'
  };

  const classes = [
    baseClasses,
    variantClasses[variant],
    className
  ].filter(Boolean).join(' ');

  return (
    <h2 className={classes}>
      {Icon && (
        <div className="w-6 h-6 flex items-center justify-center bg-violet-500/20 text-violet-400 rounded-lg">
          <Icon size={16} />
        </div>
      )}
      {children}
    </h2>
  );
} 