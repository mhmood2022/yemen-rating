import React from 'react';
import { Check, ShieldCheck } from 'lucide-react';
import { cn } from '../../lib/utils';

interface YrVerifiedBadgeProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const YrVerifiedBadge: React.FC<YrVerifiedBadgeProps> = ({
  text = 'موثّق',
  size = 'md',
  showText = true,
  className,
}) => {
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2',
  };

  const iconSizes = {
    sm: 11,
    md: 13,
    lg: 15,
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-black rounded-full select-none shadow-sm transition-transform',
        'bg-[#F5C400] text-[#000000] border border-[#F5C400]/40',
        sizeClasses[size],
        className
      )}
      title="نشاط موثق رسمياً على منصة يمن ريتغ (YR Verified)"
    >
      <div className="w-3.5 h-3.5 rounded-full bg-black text-[#F5C400] flex items-center justify-center shrink-0">
        <Check size={iconSizes[size]} strokeWidth={3.5} />
      </div>
      {showText && <span className="leading-none">{text}</span>}
    </span>
  );
};
