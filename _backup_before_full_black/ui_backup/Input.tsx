import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  rightIcon?: React.ReactNode;
  leftIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, rightIcon, leftIcon, className, disabled, id, ...props }, ref) => {
    const inputId = id || (label ? label.replace(/\s+/g, '-').toLowerCase() : undefined);

    return (
      <div className="w-full space-y-1.5 text-right">
        {label && (
          <label htmlFor={inputId} className="block text-xs sm:text-sm font-semibold text-[#0B1F3A] dark:text-white">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {rightIcon && (
            <div className="absolute right-3.5 flex items-center pointer-events-none text-[#94A3B8] dark:text-[#71717A]">
              {rightIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={cn(
              'w-full h-[42px] px-3.5 text-xs sm:text-sm rounded-[10px] outline-none transition-colors border',
              'bg-white dark:bg-[#0A0A0A] text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] dark:placeholder:text-[#71717A]',
              'border-[#CBD5E1] dark:border-[#222222]',
              'focus:border-[#0B1F3A] dark:focus:border-[#F5C400] focus:ring-1 focus:ring-[#0B1F3A] dark:focus:ring-[#F5C400]',
              error ? 'border-[#DC2626] dark:border-[#DC2626] focus:border-[#DC2626]' : '',
              disabled ? 'bg-[#F1F5F9] dark:bg-[#000000] text-[#94A3B8] dark:text-[#71717A] cursor-not-allowed' : '',
              rightIcon ? 'pr-10' : '',
              leftIcon ? 'pl-10' : '',
              className
            )}
            {...props}
          />
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-[#94A3B8] dark:text-[#71717A]">
              {leftIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs font-semibold text-[#DC2626]">{error}</p>}
        {!error && helperText && <p className="text-xs text-[#94A3B8] dark:text-[#71717A]">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
