import React from 'react';
import { cn } from '../../lib/utils';
import { LoadingSpinner } from './LoadingSpinner';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      fullWidth = false,
      icon,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'h-[36px] px-3 text-xs sm:text-sm font-semibold rounded-[9px]',
      md: 'h-[40px] px-4 text-sm font-semibold rounded-[10px]',
      lg: 'h-[44px] px-6 text-sm sm:text-base font-bold rounded-[10px]',
    };

    const variantClasses = {
      primary: 'bg-[#0B1F3A] text-white hover:bg-[#162F52] dark:bg-[#F5C400] dark:text-[#000000] dark:hover:bg-[#DDAF00] dark:font-bold',
      secondary: 'bg-[#F5C400] text-[#0B1F3A] hover:bg-[#DDAF00] dark:bg-[#1A1A1A] dark:text-[#F5C400] dark:hover:bg-[#262626] dark:border dark:border-[#F5C400]/30',
      outline: 'border border-[#E2E8F0] dark:border-[#222222] bg-transparent text-[#0B1F3A] dark:text-white hover:bg-[#F1F5F9] dark:hover:bg-[#141414]',
      danger: 'bg-[#DC2626] text-white hover:bg-[#B91C1C] dark:bg-[#DC2626]/90 dark:hover:bg-[#DC2626]',
      ghost: 'bg-transparent text-[#475569] dark:text-[#A1A1AA] hover:bg-[#F1F5F9] dark:hover:bg-[#141414] hover:text-[#0B1F3A] dark:hover:text-white',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center gap-2 transition-all select-none outline-none focus-visible:ring-2 focus-visible:ring-[#0B1F3A] dark:focus-visible:ring-[#F5C400] focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed',
          sizeClasses[size],
          variantClasses[variant],
          fullWidth ? 'w-full' : '',
          className
        )}
        {...props}
      >
        {isLoading ? <LoadingSpinner size={size === 'sm' ? 14 : 16} /> : icon}
        <span>{children}</span>
      </button>
    );
  }
);

Button.displayName = 'Button';
