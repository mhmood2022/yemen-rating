import React, { useState, useEffect } from 'react';
import { BusinessItem } from '../../types/business';
import { BusinessCard } from '../../components/business/BusinessCard';
import { YrAdBanner } from '../../components/ads/YrAdBanner';
import { SearchInput } from '../../components/ui/SearchInput';
import { Select } from '../../components/ui/Select';
import { EmptyState } from '../../components/ui/EmptyState';
import { CITIES_LIST } from '../../data/demoBusinesses';
import { ArrowRight, Star, ShieldCheck, Sparkles, Building2, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { fetchBusinesses } from '../../services/businessService';

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
  const [businesses, setBusinesses] = useState<BusinessItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [activeTier, setActiveTier] = useState<'all' | 'premium' | 'verified'>('all');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    // جلب البيانات حصرياً من Supabase مع تطبيق فلترة التصنيف والحالة active
    fetchBusinesses(categorySlug)
      .then((data: any[]) => {
        if (isMounted) {
          // تحويل البيانات لتتطابق مع BusinessItem
          setBusinesses(data as BusinessItem[]);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error loading category businesses:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [categorySlug]);

  // Sponsored Banner for Top of Category Page (إذا وجد)
  const topCategoryAd = null;

  // Category Entities مع فلترة البحث والمدينة
  const categoryBusinesses = React.useMemo(() => {
    return businesses.filter((b) => {
      if (selectedCity && b.city !== selectedCity) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return b.name?.toLowerCase().includes(q) || b.description?.toLowerCase().includes(q);
      }
      return true;
    });
  }, [businesses, selectedCity, searchQuery]);

  const premiumVerified = categoryBusinesses.filter((b: any) => b.isVerified && (b.tier === 'PREMIUM_VERIFIED' || (b.yrScore || 0) >= 95));
  const standardVerified = categoryBusinesses.filter((b: any) => b.isVerified && !premiumVerified.includes(b));
  const communityRated = categoryBusinesses.filter((b: any) => !b.isVerified);

  const displayedBusinesses = React.useMemo(() => {
    if (activeTier === 'premium') return [...premiumVerified, ...standardVerified];
    if (activeTier === 'verified') return standardVerified;
    return categoryBusinesses;
  }, [activeTier, categoryBusinesses, premiumVerified, standardVerified]);

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white pb-24" dir="rtl">
      {/* الهيدر العلوي */}
      <div className="bg-[#12121A] border-b border-zinc-800/80 sticky top-0 z-30 px-4 py-3 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Building2 className="w-5 h-5" />
            </div>
            <h1 className="text-base sm:text-lg font-black text-white">{categoryTitle}</h1>
          </div>
          <button 
            onClick={() => onNavigate('/directory')}
            className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {topCategoryAd && <YrAdBanner ad={topCategoryAd} />}

        {/* البحث والفلترة */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder={`ابحث في ${categoryTitle}...`} />
            </div>
            <div className="w-40">
              <Select
                value={selectedCity}
                onChange={setSelectedCity}
                options={[{ value: '', label: 'كل المدن' }, ...CITIES_LIST.map(c => ({ value: c, label: c }))]}
              />
            </div>
          </div>

          {/* تباين المستويات */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTier('all')}
              className={cn("px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition", activeTier === 'all' ? "bg-amber-400 text-black" : "bg-[#14141C] text-zinc-400 border border-zinc-800")}
            >
              الكل ({categoryBusinesses.length})
            </button>
            <button
              onClick={() => setActiveTier('premium')}
              className={cn("px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition", activeTier === 'premium' ? "bg-amber-400 text-black" : "bg-[#14141C] text-zinc-400 border border-zinc-800")}
            >
              المميزة والموثقة
            </button>
          </div>
        </div>

        {/* المحتوى */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
            <p className="text-xs text-zinc-400">جاري تحميل المنشآت النشطة...</p>
          </div>
        ) : displayedBusinesses.length === 0 ? (
          <div className="py-12">
            <EmptyState
              title={`لا توجد منشآت نشطة في ${categoryTitle}`}
              description="لم يتم العثور على أي نتائج مطابقة للبحث أو الفلتر الحالي."
              actionLabel="إعادة ضبط الفلاتر"
              onAction={() => { setSearchQuery(''); setSelectedCity(''); setActiveTier('all'); }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedBusinesses.map((biz, idx) => (
              <BusinessCard
                key={biz.id}
                business={biz}
                rank={idx + 1}
                onOpenProfile={(b) => onNavigate(`/businesses/${b.slug || b.id}`)}
                onOpenQuote={() => {}}
                onToggleCompare={() => {}}
                isCompared={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
