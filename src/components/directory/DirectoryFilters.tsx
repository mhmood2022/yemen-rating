import React, { useState } from 'react';
import { CITIES_LIST, CATEGORIES_LIST } from '../../data/demoBusinesses';
import { DirectoryFilterState } from '../../types/business';
import { Button } from '../ui/Button';
import { SlidersHorizontal, RotateCcw, ChevronDown, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DirectoryFiltersProps {
  filters: DirectoryFilterState;
  onChange: (newFilters: DirectoryFilterState) => void;
  onReset: () => void;
  isInsideModal?: boolean;
}

// Custom Compact Dropdown Component (Replaces native bulky Android select)
const FilterDropdown: React.FC<{
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (val: string) => void;
}> = ({ label, value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel = options.find((o) => o.value === value)?.label || options[0]?.label;

  return (
    <div className="space-y-1 text-right relative">
      <label className="block text-[11px] font-bold text-[#475569] dark:text-[#A1A1AA]">{label}</label>
      
      {/* Dropdown Trigger Box - Compact 38px */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full h-[38px] px-3 text-xs rounded-[9px] border flex items-center justify-between transition-all outline-none',
          'bg-white dark:bg-[#0E0E0E] text-[#0B1F3A] dark:text-white',
          'border-[#CBD5E1] dark:border-[#222222]',
          isOpen ? 'border-[#0B1F3A] dark:border-[#F5C400] ring-1 ring-[#0B1F3A] dark:ring-[#F5C400]' : 'hover:border-[#94A3B8] dark:hover:border-[#333333]'
        )}
      >
        <span className="truncate font-semibold">{selectedLabel}</span>
        <ChevronDown size={15} strokeWidth={1.75} className={cn('text-[#94A3B8] dark:text-[#71717A] transition-transform duration-150', isOpen && 'rotate-180 text-[#0B1F3A] dark:text-[#F5C400]')} />
      </button>

      {/* Options Menu - Custom Dark #0E0E0E */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 left-0 top-[60px] z-50 rounded-[10px] shadow-xl border border-[#E2E8F0] dark:border-[#262626] bg-white dark:bg-[#0E0E0E] max-h-[220px] overflow-y-auto py-1 animate-in fade-in zoom-in-95 duration-100">
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
                  {isSelected && <Check size={14} strokeWidth={2.5} className="text-[#0B1F3A] dark:text-[#F5C400] shrink-0" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export const DirectoryFilters: React.FC<DirectoryFiltersProps> = ({
  filters,
  onChange,
  onReset,
  isInsideModal = false,
}) => {
  const cityOptions = [
    { label: 'جميع المدن', value: '' },
    ...CITIES_LIST.map((c) => ({ label: c, value: c })),
  ];

  const categoryOptions = [
    { label: 'جميع التصنيفات', value: '' },
    ...CATEGORIES_LIST.map((cat) => ({ label: cat, value: cat })),
  ];

  const sortOptions = [
    { label: 'الأعلى تقييمًا (YR Score)', value: 'highest_score' },
    { label: 'الأكثر تقييمًا', value: 'most_reviewed' },
    { label: 'الأكثر ظهورًا (الترند)', value: 'trending' },
    { label: 'الأحدث', value: 'newest' },
  ];

  return (
    <div
      className={cn(
        'space-y-3.5 rounded-[14px]',
        isInsideModal
          ? 'p-0 bg-transparent'
          : 'p-4 bg-white dark:bg-[#000000] border border-[#E2E8F0] dark:border-[#222222]'
      )}
    >
      {!isInsideModal && (
        <div className="flex items-center justify-between pb-2.5 border-b border-[#E2E8F0] dark:border-[#222222]">
          <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-[#0B1F3A] dark:text-white">
            <SlidersHorizontal size={15} strokeWidth={1.75} className="text-[#0B1F3A] dark:text-[#F5C400]" />
            <span>تصفية النتائج</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onReset} className="h-[28px] px-2 text-xs text-[#DC2626] dark:text-[#F87171]">
            <RotateCcw size={11} strokeWidth={1.75} />
            <span>إعادة ضبط</span>
          </Button>
        </div>
      )}

      {/* Compact City Dropdown */}
      <FilterDropdown
        label="المدينة"
        value={filters.city}
        options={cityOptions}
        onChange={(val) => onChange({ ...filters, city: val })}
      />

      {/* Compact Category Dropdown */}
      <FilterDropdown
        label="التصنيف"
        value={filters.category}
        options={categoryOptions}
        onChange={(val) => onChange({ ...filters, category: val })}
      />

      {/* Compact Sort Dropdown */}
      <FilterDropdown
        label="الترتيب حسب"
        value={filters.sortBy}
        options={sortOptions}
        onChange={(val) => onChange({ ...filters, sortBy: val as any })}
      />

      {/* Verified Checkbox */}
      <div className="pt-2 border-t border-[#F1F5F9] dark:border-[#222222]">
        <label className="flex items-center gap-2 text-xs font-semibold text-[#0B1F3A] dark:text-white cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filters.verifiedOnly}
            onChange={(e) => onChange({ ...filters, verifiedOnly: e.target.checked })}
            className="w-4 h-4 rounded text-[#0B1F3A] dark:text-[#F5C400] focus:ring-[#0B1F3A] dark:focus:ring-[#F5C400] bg-white dark:bg-[#0E0E0E] border-[#CBD5E1] dark:border-[#222222]"
          />
          <span>الأنشطة الموثقة فقط</span>
        </label>
      </div>
    </div>
  );
};
