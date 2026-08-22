import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverable = false,
  noPadding = false,
  ...props
}) => {
  return (
    <div
      className={cn(
        'rounded-[14px] border transition-all',
        'bg-white dark:bg-[#10263F] border-[#E2E8F0] dark:border-[#263A52] text-[#0F172A] dark:text-[#F8FAFC]',
        'shadow-sm dark:shadow-md',
        !noPadding ? 'p-5' : '',
        hoverable ? 'hover:shadow-md hover:border-[#CBD5E1] dark:hover:border-[#3B5473]' : '',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
