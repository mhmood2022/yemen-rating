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
          <label htmlFor={inputId} className="block text-sm font-semibold text-[#0B1F3A]">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {rightIcon && (
            <div className="absolute right-3.5 flex items-center pointer-events-none text-[#94A3B8]">
              {rightIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={cn(
              'w-full h-[44px] px-3.5 text-sm bg-white text-[#0F172A] placeholder:text-[#94A3B8] border rounded-[10px] outline-none transition-colors',
              'focus:border-[#0B1F3A] focus:ring-1 focus:ring-[#0B1F3A]',
              error ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]' : 'border-[#CBD5E1]',
              disabled ? 'bg-[#F1F5F9] text-[#94A3B8] cursor-not-allowed' : '',
              rightIcon ? 'pr-10' : '',
              leftIcon ? 'pl-10' : '',
              className
            )}
            {...props}
          />
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-[#94A3B8]">
              {leftIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs font-semibold text-[#DC2626]">{error}</p>}
        {!error && helperText && <p className="text-xs text-[#94A3B8]">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
