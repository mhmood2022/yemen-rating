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
    primary: 'bg-[#0B1F3A]/10 text-[#0B1F3A] dark:bg-[#0B1F3A]/60 dark:text-[#F8FAFC] border border-[#0B1F3A]/20 dark:border-[#263A52]',
    yellow: 'bg-[#F5C400]/20 text-[#0B1F3A] dark:bg-[#F5C400]/15 dark:text-[#F5C400] font-bold border border-[#F5C400]/40 dark:border-[#F5C400]/30',
    success: 'bg-[#16A34A]/10 text-[#16A34A] dark:bg-[#16A34A]/20 dark:text-[#4ADE80] border border-[#16A34A]/20 dark:border-[#16A34A]/30',
    danger: 'bg-[#DC2626]/10 text-[#DC2626] dark:bg-[#DC2626]/20 dark:text-[#F87171] border border-[#DC2626]/20 dark:border-[#DC2626]/30',
    warning: 'bg-[#F59E0B]/10 text-[#B45309] dark:bg-[#F59E0B]/20 dark:text-[#FBBF24] border border-[#F59E0B]/20 dark:border-[#F59E0B]/30',
    info: 'bg-[#2563EB]/10 text-[#2563EB] dark:bg-[#2563EB]/20 dark:text-[#60A5FA] border border-[#2563EB]/20 dark:border-[#2563EB]/30',
    neutral: 'bg-[#F1F5F9] text-[#475569] dark:bg-[#0F2138] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#263A52]',
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
