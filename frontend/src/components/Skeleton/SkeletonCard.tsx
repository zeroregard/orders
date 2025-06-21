import React from 'react';
import './Skeleton.css';

interface SkeletonCardProps {
  variant?: 'graph' | 'list' | 'detail';
  count?: number;
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ 
  variant = 'list',
  count = 1,
  className = ''
}) => {
  const renderSkeleton = () => {
    switch (variant) {
      case 'graph':
        return (
          <div className="w-full animate-pulse bg-white/5 rounded-lg p-6">
            {/* Title */}
            <div className="h-8 bg-white/10 rounded w-1/3 mb-6" />
            
            {/* Month labels */}
            <div className="flex mb-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="flex-1">
                  <div className="h-4 bg-white/10 rounded w-8" />
                </div>
              ))}
            </div>
            
            {/* Graph grid */}
            <div className="flex h-[200px] mb-6">
              {Array.from({ length: 52 }).map((_, weekIndex) => (
                <div key={weekIndex} className="flex-1 flex flex-col gap-1">
                  {Array.from({ length: 7 }).map((_, dayIndex) => (
                    <div 
                      key={dayIndex}
                      className="h-4 bg-white/10 rounded"
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Prediction text */}
            <div className="h-12 bg-white/10 rounded w-full" />
          </div>
        );

      case 'detail':
        return (
          <div className="w-full animate-pulse bg-white/5 rounded-lg p-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div className="flex gap-4 items-center">
                <div className="h-12 w-12 bg-white/10 rounded-full" /> {/* Icon */}
                <div>
                  <div className="h-8 bg-white/10 rounded w-64 mb-2" /> {/* Title */}
                  <div className="h-4 bg-white/10 rounded w-40" /> {/* Subtitle */}
                </div>
              </div>
              <div className="h-10 w-28 bg-white/10 rounded" /> {/* Action button */}
            </div>

            {/* Content sections */}
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-6 w-6 bg-white/10 rounded" /> {/* Icon */}
                      <div className="h-4 bg-white/10 rounded w-20" /> {/* Label */}
                    </div>
                    <div className="h-5 bg-white/10 rounded w-full" /> {/* Value */}
                  </div>
                ))}
              </div>

              {/* Additional content blocks */}
              <div className="space-y-4">
                <div className="h-24 bg-white/5 rounded-lg w-full" />
                <div className="h-24 bg-white/5 rounded-lg w-full" />
              </div>
            </div>
          </div>
        );

      default: // list item
        return (
          <div className="w-full animate-pulse bg-white/5 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-3 flex-1">
                <div className="h-6 w-6 bg-white/10 rounded" /> {/* Icon */}
                <div className="flex-1">
                  <div className="h-6 bg-white/10 rounded w-3/4 mb-2" /> {/* Title */}
                  <div className="h-4 bg-white/10 rounded w-1/2" /> {/* Subtitle */}
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-8 bg-white/10 rounded" /> {/* Action button */}
                <div className="h-8 w-8 bg-white/10 rounded" /> {/* Action button */}
              </div>
            </div>

            {/* Meta information */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-white/10 rounded" /> {/* Icon */}
                <div className="h-4 bg-white/10 rounded w-32" /> {/* Text */}
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-white/10 rounded" /> {/* Icon */}
                <div className="h-4 bg-white/10 rounded w-40" /> {/* Text */}
              </div>
            </div>

            {/* Line items preview */}
            <div className="border-t border-white/10 pt-4">
              <div className="h-4 bg-white/10 rounded w-24 mb-3" /> {/* Section title */}
              <div className="space-y-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="h-4 bg-white/10 rounded w-1/3" />
                    <div className="h-4 bg-white/10 rounded w-16" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`w-full space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="w-full">
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
}; 