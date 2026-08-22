import React from 'react';
import { CITIES_LIST, CATEGORIES_LIST } from '../../data/demoBusinesses';
import { DirectoryFilterState } from '../../types/business';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';

interface DirectoryFiltersProps {
  filters: DirectoryFilterState;
  onChange: (newFilters: DirectoryFilterState) => void;
  onReset: () => void;
}

export const DirectoryFilters: React.FC<DirectoryFiltersProps> = ({ filters, onChange, onReset }) => {
  return (
    <Card className="p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#222222]">
        <div className="flex items-center gap-2 font-bold text-sm text-[#0B1F3A] dark:text-white">
          <SlidersHorizontal size={16} strokeWidth={1.75} className="text-[#0B1F3A] dark:text-[#F5C400]" />
          <span>تصفية النتائج</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onReset} className="h-[30px] px-2 text-xs text-[#DC2626] dark:text-[#F87171]">
          <RotateCcw size={12} strokeWidth={1.75} />
          <span>إعادة ضبط</span>
        </Button>
      </div>

      {/* City Select */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-[#0B1F3A] dark:text-white">المدينة</label>
        <select
          value={filters.city}
          onChange={(e) => onChange({ ...filters, city: e.target.value })}
          className="w-full h-[42px] px-3.5 text-xs bg-white dark:bg-[#0A0A0A] text-[#0B1F3A] dark:text-white border border-[#CBD5E1] dark:border-[#222222] rounded-[10px] outline-none focus:border-[#0B1F3A] dark:focus:border-[#F5C400] transition-colors"
        >
          <option value="" className="bg-white dark:bg-[#0A0A0A] text-[#0B1F3A] dark:text-white">جميع المدن</option>
          {CITIES_LIST.map((c) => (
            <option key={c} value={c} className="bg-white dark:bg-[#0A0A0A] text-[#0B1F3A] dark:text-white">{c}</option>
          ))}
        </select>
      </div>

      {/* Category Select */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-[#0B1F3A] dark:text-white">التصنيف</label>
        <select
          value={filters.category}
          onChange={(e) => onChange({ ...filters, category: e.target.value })}
          className="w-full h-[42px] px-3.5 text-xs bg-white dark:bg-[#0A0A0A] text-[#0B1F3A] dark:text-white border border-[#CBD5E1] dark:border-[#222222] rounded-[10px] outline-none focus:border-[#0B1F3A] dark:focus:border-[#F5C400] transition-colors"
        >
          <option value="" className="bg-white dark:bg-[#0A0A0A] text-[#0B1F3A] dark:text-white">جميع التصنيفات</option>
          {CATEGORIES_LIST.map((cat) => (
            <option key={cat} value={cat} className="bg-white dark:bg-[#0A0A0A] text-[#0B1F3A] dark:text-white">{cat}</option>
          ))}
        </select>
      </div>

      {/* Sort Select */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-[#0B1F3A] dark:text-white">الترتيب حسب</label>
        <select
          value={filters.sortBy}
          onChange={(e) => onChange({ ...filters, sortBy: e.target.value as any })}
          className="w-full h-[42px] px-3.5 text-xs bg-white dark:bg-[#0A0A0A] text-[#0B1F3A] dark:text-white border border-[#CBD5E1] dark:border-[#222222] rounded-[10px] outline-none focus:border-[#0B1F3A] dark:focus:border-[#F5C400] transition-colors"
        >
          <option value="highest_score" className="bg-white dark:bg-[#0A0A0A] text-[#0B1F3A] dark:text-white">الأعلى تقييمًا (YR Score)</option>
          <option value="most_reviewed" className="bg-white dark:bg-[#0A0A0A] text-[#0B1F3A] dark:text-white">الأكثر تقييمًا</option>
          <option value="trending" className="bg-white dark:bg-[#0A0A0A] text-[#0B1F3A] dark:text-white">الأكثر ظهورًا (الترند)</option>
          <option value="newest" className="bg-white dark:bg-[#0A0A0A] text-[#0B1F3A] dark:text-white">الأحدث</option>
        </select>
      </div>

      {/* Verified Checkbox */}
      <div className="pt-2 border-t border-[#F1F5F9] dark:border-[#222222]">
        <label className="flex items-center gap-2 text-xs font-semibold text-[#0B1F3A] dark:text-white cursor-pointer">
          <input
            type="checkbox"
            checked={filters.verifiedOnly}
            onChange={(e) => onChange({ ...filters, verifiedOnly: e.target.checked })}
            className="w-4 h-4 rounded text-[#0B1F3A] dark:text-[#F5C400] focus:ring-[#0B1F3A] dark:focus:ring-[#F5C400]"
          />
          <span>الأنشطة الموثقة فقط</span>
        </label>
      </div>
    </Card>
  );
};
