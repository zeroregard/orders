import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Title } from '../Typography/Title';

interface DetailCardProps {
  title?: string;
  icon?: LucideIcon;
  className?: string;
  children: React.ReactNode;
}

export function DetailCard({
  title,
  icon,
  className = '',
  children
}: DetailCardProps) {
  return (
    <div className={`bg-white/5 border border-white/20 rounded-2xl p-6 ${className}`}>
      {(title || icon) && (
        <div className="mb-6">
          <Title icon={icon}>{title}</Title>
        </div>
      )}
      {children}
    </div>
  );
} 