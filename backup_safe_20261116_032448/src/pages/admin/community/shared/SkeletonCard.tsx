import React from 'react';
interface Props { variant?: 'post' | 'user' | 'report' | 'simple'; count?: number; }
const Block: React.FC<{ className?: string }> = ({ className = '' }) => <div className={`animate-pulse rounded ${className}`} style={{ background: '#1F2024' }} />;

export const SkeletonCard: React.FC<Props> = ({ variant = 'simple', count = 3 }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="rounded-2xl p-4 space-y-3" style={{ background: '#000000', border: '1px solid #2A2B30' }}>
        {variant === 'post' && (<><div className="flex items-center gap-3"><Block className="w-10 h-10 rounded-full" /><div className="flex-1 space-y-2"><Block className="h-3 w-32" /><Block className="h-2.5 w-20" /></div></div><Block className="h-3 w-full" /><Block className="h-3 w-4/5" /></>)}
        {variant === 'user' && (<div className="flex items-center gap-3"><Block className="w-12 h-12 rounded-full" /><div className="flex-1 space-y-2"><Block className="h-3 w-40" /><Block className="h-2.5 w-24" /></div></div>)}
        {variant === 'report' && (<><Block className="h-5 w-24" /><Block className="h-3 w-full" /><Block className="h-3 w-3/4" /></>)}
        {variant === 'simple' && (<><Block className="h-3 w-1/3" /><Block className="h-3 w-full" /></>)}
      </div>
    ))}
  </>
);
