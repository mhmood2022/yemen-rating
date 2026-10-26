import React from 'react';
import { Award } from 'lucide-react';
import { cn } from '../../lib/utils';

interface BusinessScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const BusinessScore: React.FC<BusinessScoreProps> = ({
  score,
  size = 'md',
  showLabel = true,
}) => {
  const getScoreColor = (val: number) => {
    if (val >= 90) return 'text-[#16A34A] border-[#16A34A]/30 bg-[#16A34A]/10';
    if (val >= 75) return 'text-[#0B1F3A] border-[#F5C400] bg-[#F5C400]/15';
    if (val >= 50) return 'text-[#F59E0B] border-[#F59E0B]/30 bg-[#F59E0B]/10';
    return 'text-[#DC2626] border-[#DC2626]/30 bg-[#DC2626]/10';
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 rounded-[6px] gap-1 font-bold',
    md: 'text-sm px-2.5 py-1 rounded-[8px] gap-1.5 font-extrabold',
    lg: 'text-base px-3.5 py-1.5 rounded-[10px] gap-2 font-black',
  };

  return (
    <div className="inline-flex items-center gap-1.5" title={`YR Score: ${score} من 100`}>
      <div
        className={cn(
          'inline-flex items-center border select-none transition-transform',
          getScoreColor(score),
          sizeClasses[size]
        )}
      >
        <Award size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} strokeWidth={2} />
        <span>{score}</span>
        <span className="opacity-60 text-[10px] font-normal">/ 100</span>
      </div>
      {showLabel && (
        <span className="text-[11px] font-bold text-[#64748B] hidden sm:inline-block">YR Score</span>
      )}
    </div>
  );
};
