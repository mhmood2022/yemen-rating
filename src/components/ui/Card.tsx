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
        'bg-white rounded-[14px] border border-[#E2E8F0] shadow-sm transition-all',
        !noPadding ? 'p-5' : '',
        hoverable ? 'hover:shadow-md hover:border-[#CBD5E1]' : '',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
