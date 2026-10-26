import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 20, className }) => {
  return (
    <Loader2
      size={size}
      strokeWidth={2}
      className={cn('animate-spin text-current', className)}
    />
  );
};
