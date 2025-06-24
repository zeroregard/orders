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
    <div className={`bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition-colors ${className}`}>
      {(title || icon) && (
        <div className="mb-6">
          <Title icon={icon}>{title}</Title>
        </div>
      )}
      {children}
    </div>
  );
} 