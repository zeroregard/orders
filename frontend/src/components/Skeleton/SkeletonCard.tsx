import React from 'react';
import './Skeleton.css';

interface SkeletonCardProps {
  variant?: 'graph' | 'list' | 'detail';
  count?: number;
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  variant = 'detail',
  count = 1,
  className = ''
}) => {
  const renderSkeleton = () => {
    switch (variant) {
      case 'graph':
        return (
          <div className="w-full animate-pulse bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="h-8 bg-gray-700 rounded-lg w-48 mb-6" />
            <div className="space-y-4">
              <div className="h-40 bg-gray-700 rounded-lg w-full" />
              <div className="h-40 bg-gray-700 rounded-lg w-full" />
            </div>
          </div>
        );

      case 'list':
        return Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="w-full animate-pulse bg-gray-800 border border-gray-700 rounded-xl p-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gray-700 rounded-lg" />
              <div className="flex-1">
                <div className="h-6 bg-gray-700 rounded-lg w-3/4 mb-2" />
                <div className="h-4 bg-gray-700 rounded-lg w-1/2" />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="h-5 bg-gray-700 rounded-lg w-24" />
              <div className="h-5 bg-gray-700 rounded-lg w-32" />
            </div>
          </div>
        ));

      case 'detail':
        return (
          <div className="w-full animate-pulse bg-gray-800 border border-gray-700 rounded-xl p-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div className="flex gap-4 items-center">
                <div className="h-12 w-12 bg-gray-700 rounded-lg" /> {/* Icon */}
                <div>
                  <div className="h-8 bg-gray-700 rounded-lg w-64 mb-2" /> {/* Title */}
                  <div className="h-4 bg-gray-700 rounded-lg w-40" /> {/* Subtitle */}
                </div>
              </div>
              <div className="h-10 w-28 bg-gray-700 rounded-lg" /> {/* Action button */}
            </div>

            {/* Content sections */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-6 w-6 bg-gray-700 rounded-lg" /> {/* Icon */}
                      <div className="h-4 bg-gray-700 rounded-lg w-20" /> {/* Label */}
                    </div>
                    <div className="h-5 bg-gray-700 rounded-lg w-full" /> {/* Value */}
                  </div>
                ))}
              </div>

              {/* Additional content blocks */}
              <div className="space-y-4">
                <div className="h-24 bg-gray-700/50 rounded-lg w-full" />
                <div className="h-24 bg-gray-700/50 rounded-lg w-full" />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={className}>
      {renderSkeleton()}
    </div>
  );
}; 