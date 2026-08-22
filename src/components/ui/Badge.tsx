import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'yellow' | 'success' | 'danger' | 'warning' | 'info' | 'neutral';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'neutral',
  size = 'md',
  ...props
}) => {
  const variantClasses = {
    primary: 'bg-[#0B1F3A]/10 text-[#0B1F3A] border border-[#0B1F3A]/20',
    yellow: 'bg-[#F5C400]/20 text-[#0B1F3A] font-bold border border-[#F5C400]/40',
    success: 'bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/20',
    danger: 'bg-[#DC2626]/10 text-[#DC2626] border border-[#DC2626]/20',
    warning: 'bg-[#F59E0B]/10 text-[#B45309] border border-[#F59E0B]/20',
    info: 'bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20',
    neutral: 'bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]',
  };

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 rounded-[6px]',
    md: 'text-xs font-semibold px-2.5 py-1 rounded-[8px]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium select-none',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
