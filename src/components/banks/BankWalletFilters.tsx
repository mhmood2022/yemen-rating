import React from 'react';
import { CITIES_LIST } from '../../data/demoBusinesses';
import { BankWalletFilterState } from '../../types/banksWallets';
import { SearchInput } from '../ui/SearchInput';
import { Select } from '../ui/Select';
import { Landmark, Wallet, SlidersHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';

interface BankWalletFiltersProps {
  filters: BankWalletFilterState;
  onChange: (newFilters: BankWalletFilterState) => void;
  onReset: () => void;
}

export const BankWalletFilters: React.FC<BankWalletFiltersProps> = ({ filters, onChange }) => {
  const typeButtons = [
    { id: 'all' as const, label: 'الكل', icon: SlidersHorizontal },
    { id: 'bank' as const, label: 'البنوك', icon: Landmark },
    { id: 'wallet' as const, label: 'المحافظ الإلكترونية', icon: Wallet },
  ];

  const cityOptions = [
    { label: 'جميع المحافظات', value: '' },
    ...CITIES_LIST.map((c) => ({ label: c, value: c })),
  ];

  const sortOptions = [
    { label: 'الأعلى تقييمًا (YR Score)', value: 'highest_score' },
    { label: 'الأكثر تقييمًا', value: 'most_reviewed' },
    { label: 'الترند والأكثر نمواً', value: 'trending' },
  ];

  return (
    <div className="space-y-3.5">
      {/* Type Selector Tabs */}
      <div className="flex items-center gap-2 p-1 bg-white dark:bg-[#0A0A0A] border border-[#E2E8F0] dark:border-[#222222] rounded-[12px]">
        {typeButtons.map((t) => {
          const Icon = t.icon;
          const isSelected = filters.type === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange({ ...filters, type: t.id })}
              className={cn(
                'flex-1 py-2 px-3 rounded-[9px] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all select-none',
                isSelected
                  ? 'bg-[#0B1F3A] text-white dark:bg-[#F5C400] dark:text-[#000000] shadow-sm'
                  : 'text-[#475569] dark:text-[#A1A1AA] hover:bg-[#F1F5F9] dark:hover:bg-[#141414] hover:text-[#0B1F3A] dark:hover:text-white'
              )}
            >
              <Icon size={16} strokeWidth={1.75} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search and Custom Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
        <div className="sm:col-span-6">
          <SearchInput
            placeholder="ابحث عن بنك، محفظة، أو خدمة مالية..."
            value={filters.searchQuery}
            onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
            onClear={() => onChange({ ...filters, searchQuery: '' })}
          />
        </div>

        <div className="sm:col-span-3">
          <Select
            value={filters.city}
            options={cityOptions}
            onChange={(val) => onChange({ ...filters, city: val })}
            placeholder="جميع المحافظات"
          />
        </div>

        <div className="sm:col-span-3">
          <Select
            value={filters.sortBy}
            options={sortOptions}
            onChange={(val) => onChange({ ...filters, sortBy: val as any })}
          />
        </div>
      </div>
    </div>
  );
};
