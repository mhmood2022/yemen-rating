import React from 'react';
import { CITIES_LIST } from '../../data/demoBusinesses';
import { BankWalletFilterState } from '../../types/banksWallets';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { SearchInput } from '../ui/SearchInput';
import { Landmark, Wallet, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { cn } from '../../lib/utils';

interface BankWalletFiltersProps {
  filters: BankWalletFilterState;
  onChange: (newFilters: BankWalletFilterState) => void;
  onReset: () => void;
}

export const BankWalletFilters: React.FC<BankWalletFiltersProps> = ({ filters, onChange, onReset }) => {
  const typeButtons = [
    { id: 'all' as const, label: 'الكل', icon: SlidersHorizontal },
    { id: 'bank' as const, label: 'البنوك', icon: Landmark },
    { id: 'wallet' as const, label: 'المحافظ الإلكترونية', icon: Wallet },
  ];

  return (
    <div className="space-y-4">
      {/* Type Selector Tabs (All / Banks / Wallets) */}
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

      {/* Search and Secondary Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-6">
          <SearchInput
            placeholder="ابحث عن بنك، محفظة، أو خدمة مالية..."
            value={filters.searchQuery}
            onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
            onClear={() => onChange({ ...filters, searchQuery: '' })}
          />
        </div>

        {/* City Filter */}
        <div className="sm:col-span-3">
          <select
            value={filters.city}
            onChange={(e) => onChange({ ...filters, city: e.target.value })}
            className="w-full h-[42px] px-3 text-xs bg-white dark:bg-[#0A0A0A] text-[#0B1F3A] dark:text-white border border-[#CBD5E1] dark:border-[#222222] rounded-[10px] outline-none focus:border-[#0B1F3A] dark:focus:border-[#F5C400]"
          >
            <option value="">جميع المحافظات</option>
            {CITIES_LIST.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Sort Filter */}
        <div className="sm:col-span-3">
          <select
            value={filters.sortBy}
            onChange={(e) => onChange({ ...filters, sortBy: e.target.value as any })}
            className="w-full h-[42px] px-3 text-xs bg-white dark:bg-[#0A0A0A] text-[#0B1F3A] dark:text-white border border-[#CBD5E1] dark:border-[#222222] rounded-[10px] outline-none focus:border-[#0B1F3A] dark:focus:border-[#F5C400]"
          >
            <option value="highest_score">الأعلى تقييمًا (YR Score)</option>
            <option value="most_reviewed">الأكثر تقييمًا</option>
            <option value="trending">الترند والأكثر نمواً</option>
          </select>
        </div>
      </div>
    </div>
  );
};
