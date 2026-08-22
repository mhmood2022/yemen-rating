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
      sm: 'h-[36px] px-3 text-sm font-semibold rounded-[10px]',
      md: 'h-[40px] px-4 text-base font-semibold rounded-[10px]',
      lg: 'h-[44px] px-6 text-base font-bold rounded-[10px]',
    };

    const variantClasses = {
      primary: 'bg-[#0B1F3A] text-white hover:bg-[#162F52] active:bg-[#071527]',
      secondary: 'bg-[#F5C400] text-[#0B1F3A] hover:bg-[#DDAF00] active:bg-[#C29A00]',
      outline: 'border border-[#E2E8F0] bg-transparent text-[#0B1F3A] hover:bg-[#F1F5F9]',
      danger: 'bg-[#DC2626] text-white hover:bg-[#B91C1C] active:bg-[#991B1B]',
      ghost: 'bg-transparent text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0B1F3A]',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center gap-2 transition-all select-none outline-none focus-visible:ring-2 focus-visible:ring-[#0B1F3A] focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed',
          sizeClasses[size],
          variantClasses[variant],
          fullWidth ? 'w-full' : '',
          className
        )}
        {...props}
      >
        {isLoading ? <LoadingSpinner size={size === 'sm' ? 16 : 18} /> : icon}
        <span>{children}</span>
      </button>
    );
  }
);

Button.displayName = 'Button';
