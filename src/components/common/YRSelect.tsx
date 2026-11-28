import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

export interface YRSelectOption {
  value: string;
  label: string;
}

interface YRSelectProps {
  label?: string;
  error?: string;
  value: string;
  options: YRSelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  compact?: boolean;
  searchable?: boolean;
}

export const YRSelect: React.FC<YRSelectProps> = ({
  label,
  error,
  value,
  options,
  onChange,
  placeholder = 'اختر...',
  className = '',
  compact = false,
  searchable,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const showSearch = searchable ?? options.length >= 10;
  const q = query.trim().toLowerCase();
  const filteredOptions = showSearch && q
    ? options.filter((opt) => opt.label.toLowerCase().includes(q) || opt.value.toLowerCase().includes(q))
    : options;

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : (value || placeholder);

  return (
    <div className="w-full text-right space-y-1" dir="rtl">
      {label && (
        <label className="block text-xs font-bold text-[#A1A1AA]">{label}</label>
      )}
      <div ref={containerRef} className={`relative w-full ${className}`}>
      <button
        type="button"
        onClick={() => { setOpen((prev) => !prev); setQuery(''); }}
        className={`w-full flex items-center justify-between gap-2 bg-black border text-right font-bold transition-all cursor-pointer ${
          open ? 'border-white ring-1 ring-white/20' : 'border-[#2F3336] hover:border-white/50'
        } ${compact ? 'px-2.5 py-2 text-[11.5px] rounded-xl' : 'px-3 py-2.5 text-xs rounded-xl'} text-white`}
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronDown
          size={15}
          className={`shrink-0 text-[#71767B] transition-transform duration-200 ${open ? 'rotate-180 text-white' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-[99999] bg-black border border-[#2F3336] rounded-xl shadow-[0_12px_35px_rgba(0,0,0,0.95)] overflow-hidden">
          {showSearch && (
            <div className="p-1.5 border-b border-[#2F3336] flex items-center gap-1.5 bg-zinc-950" onClick={(e) => e.stopPropagation()}>
              <Search size={13} className="text-[#71767B] shrink-0 mr-1" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث داخل القائمة..."
                className="w-full bg-transparent text-[11.5px] text-white placeholder-[#71767B] outline-none caret-white py-1"
              />
            </div>
          )}
          <div className="py-1 max-h-56 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2.5 text-[11px] text-[#71767B] text-center">لا توجد نتائج مطابقة</div>
            ) : filteredOptions.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                    setQuery('');
                  }}
                  className={`w-full px-3 py-2 text-right text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected ? 'bg-white text-black' : 'text-white hover:bg-[#111111]'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check size={14} className="shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
      </div>
      {error && <p className="text-[11px] text-red-400 font-semibold">{error}</p>}
    </div>
  );
};
