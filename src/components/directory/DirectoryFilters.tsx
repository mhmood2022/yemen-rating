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
    <Card className="p-5 space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#263A52]">
        <div className="flex items-center gap-2 font-bold text-sm text-[#0B1F3A] dark:text-[#F8FAFC]">
          <SlidersHorizontal size={16} strokeWidth={1.75} />
          <span>تصفية النتائج</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onReset} className="h-[30px] px-2 text-xs text-[#DC2626] dark:text-[#F87171]">
          <RotateCcw size={12} strokeWidth={1.75} />
          <span>إعادة ضبط</span>
        </Button>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-bold text-[#0B1F3A] dark:text-[#F8FAFC]">المدينة</label>
        <select
          value={filters.city}
          onChange={(e) => onChange({ ...filters, city: e.target.value })}
          className="w-full h-[40px] px-3 text-xs bg-[#F7F8FA] dark:bg-[#0F2138] text-[#0B1F3A] dark:text-[#F8FAFC] border border-[#CBD5E1] dark:border-[#263A52] rounded-[10px] outline-none focus:border-[#0B1F3A] dark:focus:border-[#F5C400]"
        >
          <option value="">جميع المدن</option>
          {CITIES_LIST.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-bold text-[#0B1F3A] dark:text-[#F8FAFC]">التصنيف</label>
        <select
          value={filters.category}
          onChange={(e) => onChange({ ...filters, category: e.target.value })}
          className="w-full h-[40px] px-3 text-xs bg-[#F7F8FA] dark:bg-[#0F2138] text-[#0B1F3A] dark:text-[#F8FAFC] border border-[#CBD5E1] dark:border-[#263A52] rounded-[10px] outline-none focus:border-[#0B1F3A] dark:focus:border-[#F5C400]"
        >
          <option value="">جميع التصنيفات</option>
          {CATEGORIES_LIST.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-bold text-[#0B1F3A] dark:text-[#F8FAFC]">الترتيب حسب</label>
        <select
          value={filters.sortBy}
          onChange={(e) => onChange({ ...filters, sortBy: e.target.value as any })}
          className="w-full h-[40px] px-3 text-xs bg-[#F7F8FA] dark:bg-[#0F2138] text-[#0B1F3A] dark:text-[#F8FAFC] border border-[#CBD5E1] dark:border-[#263A52] rounded-[10px] outline-none focus:border-[#0B1F3A] dark:focus:border-[#F5C400]"
        >
          <option value="highest_score">الأعلى تقييمًا (YR Score)</option>
          <option value="most_reviewed">الأكثر تقييمًا</option>
          <option value="trending">الأكثر ظهورًا (الترند)</option>
          <option value="newest">الأحدث</option>
        </select>
      </div>

      <div className="pt-2 border-t border-[#F1F5F9] dark:border-[#1B2F47]">
        <label className="flex items-center gap-2 text-xs font-semibold text-[#0B1F3A] dark:text-[#F8FAFC] cursor-pointer">
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
