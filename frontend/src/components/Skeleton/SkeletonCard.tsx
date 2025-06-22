import React from 'react';
import './Skeleton.css';

interface SkeletonCardProps {
  className?: string;
  rows?: number;
}

export function SkeletonCard({
  className = '',
  rows = 3
}: SkeletonCardProps) {
  return (
    <div className={`bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 animate-pulse ${className}`}>
      <div className="space-y-4">
        {/* Header skeleton */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-lg"></div>
          <div className="flex-1">
            <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-white/10 rounded w-1/2"></div>
          </div>
        </div>
        
        {/* Content skeleton */}
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 bg-white/10 rounded w-full"></div>
            <div className="h-3 bg-white/10 rounded w-4/5"></div>
          </div>
        ))}
      </div>
    </div>
  );
} 