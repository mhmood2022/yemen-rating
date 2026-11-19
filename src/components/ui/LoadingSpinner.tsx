import React from 'react';
import { cn } from '../../lib/utils';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
  ariaLabel?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 26,
  className,
  strokeWidth = 3.2,
  ariaLabel = 'جاري التحميل',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      role="status"
      aria-label={ariaLabel}
      className={cn('yr-x-spinner shrink-0 text-current', className)}
    >
      <circle
        cx="16"
        cy="16"
        r="12.5"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        className="yr-x-spinner-arc"
      />
    </svg>
  );
};

export const XSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 26,
  className,
  strokeWidth = 3.2,
  ariaLabel = 'جاري التحميل',
}) => {
  return (
    <LoadingSpinner
      size={size}
      strokeWidth={strokeWidth}
      ariaLabel={ariaLabel}
      className={cn('text-white', className)}
    />
  );
};
