import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  value: string;
  options: SelectOption[];
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  value,
  options,
  onChange,
  placeholder = 'اختر...',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((o) => o.value === value);

  return (
    <div className="space-y-1 text-right relative w-full">
      {label && (
        <label className="block text-xs font-bold text-[#0B1F3A] dark:text-[#A1A1AA]">{label}</label>
      )}

      {/* Trigger Box */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full h-[40px] px-3 text-xs rounded-[10px] border flex items-center justify-between transition-all outline-none select-none',
          'bg-white dark:bg-[#0E0E0E] text-[#0B1F3A] dark:text-white',
          'border-[#CBD5E1] dark:border-[#222222]',
          isOpen
            ? 'border-[#0B1F3A] dark:border-[#F5C400] ring-1 ring-[#0B1F3A] dark:ring-[#F5C400]'
            : 'hover:border-[#94A3B8] dark:hover:border-[#383838]',
          className
        )}
      >
        <span className="truncate font-semibold">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown
          size={15}
          strokeWidth={1.75}
          className={cn(
            'text-[#94A3B8] dark:text-[#71717A] transition-transform duration-150 shrink-0',
            isOpen && 'rotate-180 text-[#0B1F3A] dark:text-[#F5C400]'
          )}
        />
      </button>

      {/* Custom Dropdown Menu */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 left-0 top-[65px] z-50 rounded-[10px] shadow-2xl border border-[#E2E8F0] dark:border-[#262626] bg-white dark:bg-[#0E0E0E] max-h-[220px] overflow-y-auto py-1 animate-in fade-in zoom-in-95 duration-100">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-full px-3 py-2 text-xs text-right flex items-center justify-between transition-colors',
                    isSelected
                      ? 'bg-[#F5C400]/15 dark:bg-[#F5C400]/20 text-[#0B1F3A] dark:text-[#F5C400] font-bold'
                      : 'text-[#475569] dark:text-[#D4D4D8] hover:bg-[#F1F5F9] dark:hover:bg-[#1A1A1A]'
                  )}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && (
                    <Check size={14} strokeWidth={2.5} className="text-[#0B1F3A] dark:text-[#F5C400] shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
