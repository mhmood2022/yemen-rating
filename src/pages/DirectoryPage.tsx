import React, { useState, useMemo } from 'react';
import { DEMO_BUSINESSES } from '../data/demoBusinesses';
import { DirectoryFilterState } from '../types/business';
import { DirectoryFilters } from '../components/directory/DirectoryFilters';
import { DirectoryResults } from '../components/directory/DirectoryResults';
import { SearchInput } from '../components/ui/SearchInput';
import { Button } from '../components/ui/Button';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';
import { Modal } from '../components/ui/Modal';

export const DirectoryPage: React.FC<{
  initialCategory?: string;
  initialQuery?: string;
  onNavigate: (path: string) => void;
}> = ({ initialCategory = '', initialQuery = '', onNavigate }) => {
  const [filters, setFilters] = useState<DirectoryFilterState>({
    searchQuery: initialQuery,
    category: initialCategory,
    city: '',
    minRating: 0,
    verifiedOnly: false,
    sortBy: 'highest_score',
  });

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      category: '',
      city: '',
      minRating: 0,
      verifiedOnly: false,
      sortBy: 'highest_score',
    });
  };

  const filteredBusinesses = useMemo(() => {
    return DEMO_BUSINESSES.filter((biz) => {
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchesName = biz.name.toLowerCase().includes(q);
        const matchesCategory = biz.category.toLowerCase().includes(q);
        const matchesCity = biz.city.toLowerCase().includes(q);
        const matchesServices = biz.services?.some((s) => s.toLowerCase().includes(q));
        if (!matchesName && !matchesCategory && !matchesCity && !matchesServices) {
          return false;
        }
      }

      if (filters.category && biz.category !== filters.category) {
        return false;
      }

      if (filters.city && biz.city !== filters.city) {
        return false;
      }

      if (filters.verifiedOnly && !biz.isVerified) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'highest_score') return b.yrScore - a.yrScore;
      if (filters.sortBy === 'most_reviewed') return b.reviewCount - a.reviewCount;
      if (filters.sortBy === 'trending') return (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0);
      return 0;
    });
  }, [filters]);

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-black text-[#0B1F3A] dark:text-white">دليل الأنشطة</h1>
        <p className="text-xs text-[#64748B] dark:text-[#A1A1AA]">استكشف الشركات والمحلات والخدمات الموثقة في كافة المدن اليمنية</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1">
          <SearchInput
            placeholder="ابحث عن شركة، محل، خدمة، مدينة..."
            value={filters.searchQuery}
            onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
            onClear={() => setFilters({ ...filters, searchQuery: '' })}
          />
        </div>

        <Button
          variant="outline"
          className="lg:hidden h-[42px] shrink-0 text-[#0B1F3A] dark:text-white border-[#CBD5E1] dark:border-[#222222]"
          onClick={() => setIsMobileFilterOpen(true)}
          icon={<SlidersHorizontal size={16} strokeWidth={1.75} className="text-[#0B1F3A] dark:text-[#F5C400]" />}
        >
          تصفية
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="hidden lg:block w-[280px] shrink-0 sticky top-20">
          <DirectoryFilters
            filters={filters}
            onChange={setFilters}
            onReset={resetFilters}
          />
        </div>

        <div className="flex-1 w-full space-y-4">
          <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-[#A1A1AA] px-1">
            <span>عرض <strong>{filteredBusinesses.length}</strong> من الأنشطة</span>
            {filters.category && <span className="font-bold text-[#0B1F3A] dark:text-[#F5C400]">التصنيف: {filters.category}</span>}
          </div>

          <DirectoryResults
            items={filteredBusinesses}
            onNavigate={(id) => onNavigate(`/business/${id}`)}
            onResetFilters={resetFilters}
          />
        </div>
      </div>

      {/* Mobile Filter Modal - Pure Black */}
      <Modal
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        title="تصفية دليل الأنشطة"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <DirectoryFilters
            filters={filters}
            onChange={setFilters}
            onReset={resetFilters}
            isInsideModal={true}
          />

          <div className="pt-2 flex items-center gap-2 border-t border-[#F1F5F9] dark:border-[#222222]">
            <Button
              variant="primary"
              fullWidth
              onClick={() => setIsMobileFilterOpen(false)}
              className="h-[44px] font-bold"
            >
              تطبيق التصفية ({filteredBusinesses.length} نتيجة)
            </Button>
            <Button
              variant="outline"
              onClick={resetFilters}
              className="h-[44px] px-3 shrink-0 text-[#DC2626] dark:text-[#F87171] border-[#CBD5E1] dark:border-[#222222]"
              title="إعادة ضبط"
            >
              <RotateCcw size={16} strokeWidth={1.75} />
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
