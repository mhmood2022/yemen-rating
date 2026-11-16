import React from 'react';

interface Props {
  count?: number;
}

const Block: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse rounded ${className}`} style={{ background: '#1F2024' }} />
);

export const SkeletonCard: React.FC<Props> = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-4 rounded-2xl space-y-3"
          style={{ background: '#000000', border: '1px solid #2A2B30' }}
        >
          <div className="flex items-center gap-3">
            <Block className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Block className="h-3 w-40" />
              <Block className="h-2.5 w-24" />
            </div>
            <Block className="h-5 w-16 rounded-full" />
          </div>
          <Block className="h-3 w-full" />
          <Block className="h-3 w-3/4" />
        </div>
      ))}
    </>
  );
};
