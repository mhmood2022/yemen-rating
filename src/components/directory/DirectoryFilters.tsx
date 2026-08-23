import React from 'react';
import { CITIES_LIST, CATEGORIES_LIST } from '../../data/demoBusinesses';
import { DirectoryFilterState } from '../../types/business';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DirectoryFiltersProps {
  filters: DirectoryFilterState;
  onChange: (newFilters: DirectoryFilterState) => void;
  onReset: () => void;
  isInsideModal?: boolean;
}

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

      {/* Unified Custom Selects */}
      <Select
        label="المدينة"
        value={filters.city}
        options={cityOptions}
        onChange={(val) => onChange({ ...filters, city: val })}
        placeholder="جميع المدن"
      />

      <Select
        label="التصنيف"
        value={filters.category}
        options={categoryOptions}
        onChange={(val) => onChange({ ...filters, category: val })}
        placeholder="جميع التصنيفات"
      />

      <Select
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
