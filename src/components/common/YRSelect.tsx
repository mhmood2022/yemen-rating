import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface YRSelectOption {
  value: string;
  label: string;
}

export interface YRSelectProps {
  value?: string;
  options: YRSelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const YRSelect: React.FC<YRSelectProps> = ({
  value,
  options,
  onChange,
  placeholder = 'اختر من القائمة...',
  className = '',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={`relative w-full font-['Cairo'] text-right select-none ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-[#060A13] text-white border border-slate-800 hover:border-[#F5C400]/60 focus:border-[#F5C400] rounded-xl px-3.5 py-2.5 text-xs flex items-center justify-between gap-2 transition-all cursor-pointer shadow-inner ${
          isOpen ? 'border-[#F5C400] ring-1 ring-[#F5C400]/40' : ''
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span className={`truncate font-bold ${selectedOption ? 'text-white' : 'text-slate-400'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={14}
          className={`text-[#F5C400] shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1.5 bg-[#0A0F1D] border border-slate-800 rounded-xl shadow-2xl overflow-hidden py-1 max-h-60 overflow-y-auto">
          {options.length === 0 ? (
            <div className="px-3.5 py-2 text-xs text-slate-500 text-center font-bold">لا توجد خيارات متاحة</div>
          ) : (
            options.map((option) => {
              const isSelected = option.value === value;
              return (
                <div
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`px-3.5 py-2.5 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#F5C400] text-black font-black'
                      : 'text-slate-200 hover:bg-[#F5C400]/15 hover:text-[#F5C400]'
                  }`}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && <Check size={14} className="text-black shrink-0" />}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
