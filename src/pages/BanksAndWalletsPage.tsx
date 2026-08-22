import React, { useState, useMemo } from 'react';
import { DEMO_BANKS_AND_WALLETS } from '../data/demoBanksWallets';
import { BankWalletFilterState } from '../types/banksWallets';
import { BankWalletCard } from '../components/banks/BankWalletCard';
import { BankWalletFilters } from '../components/banks/BankWalletFilters';
import { EmptyState } from '../components/ui/EmptyState';

export const BanksAndWalletsPage: React.FC<{
  initialType?: 'all' | 'bank' | 'wallet';
  onNavigate: (path: string) => void;
}> = ({ initialType = 'all', onNavigate }) => {
  const [filters, setFilters] = useState<BankWalletFilterState>({
    type: initialType,
    searchQuery: '',
    city: '',
    category: '',
    verifiedOnly: false,
    sortBy: 'highest_score',
  });

  const filteredItems = useMemo(() => {
    return DEMO_BANKS_AND_WALLETS.filter((item) => {
      if (filters.type !== 'all' && item.type !== filters.type) {
        return false;
      }

      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesComm = item.commercialName?.toLowerCase().includes(q);
        const matchesCat = item.entityCategory.toLowerCase().includes(q);
        const matchesCity = item.headquartersCity.toLowerCase().includes(q);
        const matchesServices = item.services.some((s) => s.toLowerCase().includes(q));
        if (!matchesName && !matchesComm && !matchesCat && !matchesCity && !matchesServices) {
          return false;
        }
      }

      if (filters.city && item.headquartersCity !== filters.city) {
        return false;
      }

      if (filters.verifiedOnly && !item.isVerified) {
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
        <h1 className="text-xl sm:text-2xl font-black text-[#0B1F3A] dark:text-white">
          البنوك والمحافظ الإلكترونية
        </h1>
        <p className="text-xs text-[#64748B] dark:text-[#A1A1AA]">
          دليل المؤسسات المصرفية وتطبيقات الدفع والمحافظ الرقمية في اليمن مع تقييمات YR Score وجداول الرسوم
        </p>
      </div>

      <BankWalletFilters
        filters={filters}
        onChange={setFilters}
        onReset={() =>
          setFilters({
            type: 'all',
            searchQuery: '',
            city: '',
            category: '',
            verifiedOnly: false,
            sortBy: 'highest_score',
          })
        }
      />

      <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-[#A1A1AA] px-1">
        <span>
          عرض <strong>{filteredItems.length}</strong> مؤسسة ومحفظة مالية
        </span>
        {filters.type !== 'all' && (
          <span className="font-bold text-[#0B1F3A] dark:text-[#F5C400]">
            القسم: {filters.type === 'bank' ? 'البنوك' : 'المحافظ الإلكترونية'}
          </span>
        )}
      </div>

      {filteredItems.length === 0 ? (
        <EmptyState
          title="لم يتم العثور على نتائج تطابق بحثك"
          description="جرب البحث بكلمة أخرى أو إلغاء بعض الفلاتر لعرض البنوك والمحافظ المتاحة."
          actionLabel="عرض الكل"
          onAction={() =>
            setFilters({
              type: 'all',
              searchQuery: '',
              city: '',
              category: '',
              verifiedOnly: false,
              sortBy: 'highest_score',
            })
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <BankWalletCard
              key={item.id}
              item={item}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
};
