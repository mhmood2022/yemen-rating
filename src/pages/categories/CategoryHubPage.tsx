import React, { useState, useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { BusinessItem } from '../../types/business';
import { BusinessCard } from '../../components/business/BusinessCard';
import { YrAdBanner } from '../../components/ads/YrAdBanner';
import { SearchInput } from '../../components/ui/SearchInput';
import { Select } from '../../components/ui/Select';
import { EmptyState } from '../../components/ui/EmptyState';
import { CITIES_LIST } from '../../data/demoBusinesses';
import { ArrowRight, Star, ShieldCheck, Sparkles, Building2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CategoryHubPageProps {
  categoryTitle: string;
  categorySlug: string;
  categoryIcon?: string;
  onNavigate: (path: string) => void;
}

export const CategoryHubPage: React.FC<CategoryHubPageProps> = ({
  categoryTitle,
  categorySlug,
  onNavigate,
}) => {
  const { businesses, ads } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [activeTier, setActiveTier] = useState<'all' | 'premium' | 'verified'>('all');

  // Sponsored Banner for Top of Category Page
  const topCategoryAd = ads.find(
    (a) => a.status === 'published' && (a.placements.includes('category_page') || a.placements.includes('home_top'))
  );

  // Category Entities
  const categoryBusinesses = useMemo(() => {
    return businesses.filter((b) => {
      const matchCat = b.category === categoryTitle || b.category.includes(categoryTitle);
      if (!matchCat) return false;
      if (selectedCity && b.city !== selectedCity) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return b.name.toLowerCase().includes(q) || b.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [businesses, categoryTitle, selectedCity, searchQuery]);

  // Three Tiers Breakdown (مستويات الظهور الثلاثة)
  const premiumVerified = categoryBusinesses.filter((b) => b.isVerified && (b.tier === 'PREMIUM_VERIFIED' || b.yrScore >= 95));
  const verifiedOnly = categoryBusinesses.filter((b) => b.isVerified && b.tier !== 'PREMIUM_VERIFIED' && b.yrScore < 95);
  const allRemaining = categoryBusinesses;

  const cityOptions = [
    { label: 'جميع المدن', value: '' },
    ...CITIES_LIST.map((c) => ({ label: c, value: c })),
  ];

  return (
    <div className="space-y-6 pb-8 max-w-6xl mx-auto text-right">
      {/* Top Banner Ad if Available */}
      {topCategoryAd && <YrAdBanner ad={topCategoryAd} className="mb-2" />}

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#222222]">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onNavigate('/directory')}
            className="p-1 rounded-lg text-[#64748B] dark:text-[#A1A1AA] hover:text-[#0B1F3A] dark:hover:text-white"
            aria-label="الرجوع"
          >
            <ArrowRight size={18} strokeWidth={2} />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#0B1F3A] dark:text-white">
              دليل {categoryTitle} في اليمن
            </h1>
            <p className="text-xs text-[#64748B] dark:text-[#A1A1AA]">
              استكشف أفضل {categoryTitle} الموثقة، التقييمات الحقيقية، والخدمات المعتمدة
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-[#F5C400]/20 text-[#F5C400] text-xs font-black">
          {categoryBusinesses.length} جهة معتمدة
        </span>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
        <div className="sm:col-span-8">
          <SearchInput
            placeholder={`ابحث داخل ${categoryTitle}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
          />
        </div>
        <div className="sm:col-span-4">
          <Select
            value={selectedCity}
            options={cityOptions}
            onChange={setSelectedCity}
            placeholder="جميع المحافظات"
          />
        </div>
      </div>

      {/* Tiered Content Sections */}
      {categoryBusinesses.length === 0 ? (
        <EmptyState
          title={`لم يتم العثور على نتائج في ${categoryTitle}`}
          description="جرب تغيير معايير البحث أو اختيار محافظة أخرى."
          actionLabel="عرض كافة الأنشطة"
          onAction={() => {
            setSelectedCity('');
            setSearchQuery('');
          }}
        />
      ) : (
        <div className="space-y-8">
          {/* Level 1: الجهات المميزة والموثقة (Premium Verified) */}
          {premiumVerified.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-black text-[#F5C400] pb-1 border-b border-[#F5C400]/30">
                <Sparkles size={16} strokeWidth={2.5} />
                <span>الجهات المميزة والموثقة (الأعلى تصنيفاً)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {premiumVerified.map((biz) => (
                  <BusinessCard
                    key={biz.id}
                    business={biz}
                    variant="topRated"
                    onNavigate={(id) => onNavigate(`/business/${id}`)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Level 2: الجهات الموثقة (Verified) */}
          {verifiedOnly.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-black text-[#16A34A] dark:text-[#22C55E] pb-1 border-b border-[#16A34A]/30">
                <ShieldCheck size={16} strokeWidth={2.5} />
                <span>الجهات الموثقة رسمياً</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {verifiedOnly.map((biz) => (
                  <BusinessCard
                    key={biz.id}
                    business={biz}
                    variant="standard"
                    onNavigate={(id) => onNavigate(`/business/${id}`)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Level 3: جميع الجهات في التصنيف */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-black text-[#0B1F3A] dark:text-white pb-1 border-b border-[#E2E8F0] dark:border-[#222222]">
              <Building2 size={16} strokeWidth={2} />
              <span>جميع {categoryTitle} المتاحة</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {allRemaining.map((biz) => (
                <BusinessCard
                  key={biz.id}
                  business={biz}
                  variant="standard"
                  onNavigate={(id) => onNavigate(`/business/${id}`)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
