import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface YRSelectOption { value: string; label: string; }
export interface YRSelectProps {
  value?: string; options: YRSelectOption[]; onChange: (value: string) => void;
  placeholder?: string; className?: string; disabled?: boolean; compact?: boolean;
}

export const YRSelect: React.FC<YRSelectProps> = ({
  value, options, onChange, placeholder = 'اختر من القائمة...',
  className = '', disabled = false, compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const close = (e: Event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('touchstart', close);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('touchstart', close); };
  }, []);

  const toggleOpen = () => {
    if (disabled) return;
    if (!isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const below = window.innerHeight - rect.bottom;
      setOpenUp(below < 210 && rect.top > below);
    }
    setIsOpen((p) => !p);
  };

  return (
    <div ref={dropdownRef} className={`relative w-full font-['Cairo'] text-right select-none ${className}`}>
      <button
        type="button" disabled={disabled} onClick={toggleOpen}
        className={`w-full bg-black text-white border border-[#2F3336] hover:border-white/50 rounded-xl flex items-center justify-between gap-2 transition-all cursor-pointer ${
          compact ? 'px-2.5 py-2 text-[11.5px]' : 'px-3 py-2 text-xs'
        } ${isOpen ? 'border-white' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span className={`truncate font-bold ${selectedOption ? 'text-white' : 'text-[#71767B]'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={14} className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-white' : 'text-[#71767B]'}`} />
      </button>

      {isOpen && (
        <div className={`absolute z-[9999] w-full bg-black border border-[#2F3336] rounded-xl shadow-2xl overflow-y-auto py-1 max-h-48 ${
          openUp ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
        }`}>
          {options.length === 0 ? (
            <div className="px-3 py-2 text-[11.5px] text-[#71767B] text-center font-bold">لا توجد خيارات متاحة</div>
          ) : options.map((option) => {
            const isSelected = option.value === value;
            return (
              <div
                key={option.value}
                onClick={() => { onChange(option.value); setIsOpen(false); }}
                className={`px-3 py-2 text-[11.5px] font-bold flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected ? 'bg-white text-black font-black' : 'text-[#E7E9EA] hover:bg-white/10'
                }`}
              >
                <span className="truncate">{option.label}</span>
                {isSelected && <Check size={13} className="text-black shrink-0" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
