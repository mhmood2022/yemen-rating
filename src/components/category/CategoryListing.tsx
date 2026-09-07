import React, { useState, useEffect, useMemo } from 'react';
import {
  Star, MapPin, Phone, ArrowRight, Frown, CheckCircle2,
  Bed, Wifi, Car, Stethoscope, Sparkles, Loader2, Award,
  Utensils, Gem, Truck, Users, AlertCircle, Waves, MessageCircle,
  Search, ShieldCheck
} from 'lucide-react';
import { OFFICIAL_CATEGORIES, CategoryItem } from '../../data/categories';
import { BusinessItem } from '../../data/mockData';
import { AdBanner } from '../common/AdBanner';
import { supabase } from '../../lib/supabase';

interface CategoryListingProps {
  categorySlug: string;
  businesses?: BusinessItem[];
  selectedGov?: string;
  selectedCity?: string;
  onSelectBusiness: (business: BusinessItem) => void;
  onBack?: () => void;
  onBackHome?: () => void;
}

export const CategoryListing: React.FC<CategoryListingProps> = ({
  categorySlug,
  businesses = [],
  selectedGov = 'all',
  selectedCity = 'all',
  onSelectBusiness,
  onBack,
  onBackHome
}) => {
  const handleBack = onBackHome || onBack || (() => window.history.back());
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [liveBusinesses, setLiveBusinesses] = useState<BusinessItem[]>([]);
  const [loadingLive, setLoadingLive] = useState<boolean>(true);

  const category = OFFICIAL_CATEGORIES.find(c => c.slug === categorySlug);
  const Icon = category?.icon;
  const subcategories = category?.subcategories || [];

  useEffect(() => {
    let isMounted = true;
    const fetchBusinesses = async () => {
      setLoadingLive(true);
      try {
        const { data: catRow } = await supabase
          .from('categories')
          .select('id, slug')
          .eq('slug', categorySlug)
          .maybeSingle();

        let query = supabase.from('businesses').select('*');
        if (catRow && catRow.id) {
          query = query.or(`category_id.eq.${catRow.id},category_id.eq.${categorySlug}`);
        } else {
          query = query.eq('category_id', categorySlug);
        }

        const { data: bRows, error } = await query.order('created_at', { ascending: false });

        if (!error && bRows && bRows.length > 0 && isMounted) {
          const mapped: BusinessItem[] = bRows.map(b => ({
            id: b.id,
            name: b.name,
            slug: b.slug || b.id,
            categorySlug: categorySlug,
            subCategorySlug: b.sub_category || '',
            governorateId: b.city || '',
            cityId: b.city || '',
            logo: b.logo_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80',
            coverImage: b.cover_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&auto=format&fit=crop&q=80',
            images: Array.isArray(b.gallery_urls) && b.gallery_urls.length > 0 ? b.gallery_urls : [b.cover_url || ''],
            rating: Number(b.rating) || 4.8,
            reviewsCount: Number(b.review_count) || 0,
            isVerified: b.is_verified ?? false,
            badgeType: b.badge_type || 'gold',
            claimStatus: b.claim_status || 'UNCLAIMED',
            phone: b.phone || '',
            whatsapp: b.whatsapp || '',
            website: b.website_url || '',
            address: b.address || b.city || 'اليمن',
            description: b.description || '',
            sectionsConfig: b.sections_config || {},
            reviews: []
          }));
          setLiveBusinesses(mapped);
        } else if (isMounted) {
          setLiveBusinesses([]);
        }
      } catch (err) {
        console.warn('Live fetch error:', err);
        if (isMounted) setLiveBusinesses([]);
      } finally {
        if (isMounted) setLoadingLive(false);
      }
    };

    fetchBusinesses();
    return () => { isMounted = false; };
  }, [categorySlug]);

  const allList = liveBusinesses.length > 0
    ? liveBusinesses
    : businesses.filter(b => b.categorySlug === categorySlug);

  const filtered = useMemo(() => {
    return allList.filter(b => {
      const matchesSub = selectedSubCategory === 'all' || (b as any).subCategorySlug === selectedSubCategory;
      const matchesGov = !selectedGov || selectedGov === 'all' || selectedGov === 'كل المحافظات' || b.governorateId === selectedGov;
      const matchesCity = !selectedCity || selectedCity === 'all' || b.cityId === selectedCity;
      const matchesSearch = !searchQuery.trim() || b.name.toLowerCase().includes(searchQuery.toLowerCase()) || (b.address && b.address.includes(searchQuery));
      return matchesSub && matchesGov && matchesCity && matchesSearch;
    });
  }, [allList, selectedSubCategory, selectedGov, selectedCity, searchQuery]);

  return (
    <div dir="rtl" className="space-y-6 max-w-7xl mx-auto px-3 sm:px-6 py-4 font-['Cairo',sans-serif]">
      {/* 🌟 1. إعلان البنر العلوي (YR Ads Top Unit) */}
      <div className="w-full">
        <AdBanner placementId="1" className="rounded-2xl overflow-hidden shadow-lg border border-zinc-800/80" />
      </div>

      {/* ترويسة التصنيف الرسمية الفخمة */}
      <div className="bg-gradient-to-r from-zinc-900 via-[#0D121F] to-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          {Icon && (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FFC500] to-amber-500 text-zinc-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20 shrink-0">
              <Icon className="w-8 h-8" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                {category?.name || 'تصنيف المنشآت'}
              </h1>
              <span className="text-xs px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                {filtered.length} منشأة معتمدة
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1.5">
              دليل شامل وموثوق لأفضل المنشآت والخدمات في الجمهورية اليمنية
            </p>
          </div>
        </div>

        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 text-xs font-extrabold transition border border-zinc-700 shadow-md self-end md:self-center"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة للرئيسية</span>
        </button>
      </div>

      {/* البحث وفلاتر الأقسام الفرعية */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute right-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ابحث عن اسم منشأة، فرع، أو شارع في هذا القسم..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0E1422] border border-zinc-800 focus:border-[#FFC500] text-zinc-100 placeholder-zinc-500 pr-11 pl-4 py-3 rounded-2xl text-xs sm:text-sm outline-none transition shadow-inner"
          />
        </div>

        {subcategories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedSubCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition ${
                selectedSubCategory === 'all'
                  ? 'bg-[#FFC500] text-zinc-950 shadow-md font-black'
                  : 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 border border-zinc-800'
              }`}
            >
              الكل ({allList.length})
            </button>
            {subcategories.map(sub => (
              <button
                key={sub.slug}
                onClick={() => setSelectedSubCategory(sub.slug)}
                className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition ${
                  selectedSubCategory === sub.slug
                    ? 'bg-[#FFC500] text-zinc-950 shadow-md font-black'
                    : 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 border border-zinc-800'
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* شبكة الكروت الموحدة */}
      {loadingLive ? (
        <div className="py-24 text-center flex flex-col items-center justify-center bg-[#0B0F19] rounded-3xl border border-zinc-800/80">
          <Loader2 className="w-10 h-10 animate-spin text-[#FFC500] mb-3" />
          <p className="text-sm text-zinc-400 font-bold">جاري تحميل المنشآت المعتمدة...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center bg-[#0B0F19] rounded-3xl border border-zinc-800/80 p-8 shadow-md">
          <Frown className="w-14 h-14 mx-auto text-zinc-600 mb-3" />
          <h3 className="text-base font-bold text-zinc-300 mb-1">لا توجد منشآت مسجلة في هذا التصنيف حالياً</h3>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">سيتم إضافة وتحديث المنشآت المعتمدة قريباً.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.slice(0, 3).map((item) => (
              <UnifiedBusinessCard key={item.id} item={item} onSelect={() => onSelectBusiness(item)} />
            ))}
          </div>

          {/* 🌟 2. إعلان وسط القائمة (YR Ads In-Feed Unit) */}
          <div className="w-full my-6">
            <AdBanner placementId="2" className="rounded-2xl overflow-hidden shadow-lg border border-zinc-800/80" />
          </div>

          {filtered.length > 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.slice(3).map((item) => (
                <UnifiedBusinessCard key={item.id} item={item} onSelect={() => onSelectBusiness(item)} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 🌟 3. إعلان البنر السفلي (YR Ads Bottom Unit) */}
      <div className="w-full pt-4">
        <AdBanner placementId="3" className="rounded-2xl overflow-hidden shadow-lg border border-zinc-800/80" />
      </div>
    </div>
  );
};

function UnifiedBusinessCard({ item, onSelect }: { item: BusinessItem; onSelect: () => void }) {
  const feat = (item.sectionsConfig as any)?.features || {};

  return (
    <div className="bg-[#0B0F19] rounded-2xl border border-zinc-800/90 overflow-hidden hover:border-[#FFC500]/60 transition-all duration-300 flex flex-col justify-between group shadow-xl hover:-translate-y-1">
      <div>
        <div className="relative h-44 bg-zinc-900 overflow-hidden cursor-pointer" onClick={onSelect}>
          <img
            src={item.coverImage}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-black/40" />

          <div className="absolute bottom-3 right-3 w-14 h-14 rounded-xl bg-zinc-900/95 p-1 shadow-xl border border-zinc-700">
            <img src={item.logo} alt={item.name} className="w-full h-full object-contain rounded-lg" />
          </div>

          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            {item.isVerified ? (
              <span className="bg-emerald-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                <CheckCircle2 className="w-3 h-3" /> موثّق
              </span>
            ) : (
              <span className="bg-amber-500/90 text-zinc-950 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                <ShieldCheck className="w-3 h-3" /> غير مطالب به
              </span>
            )}
            <span className="bg-black/60 backdrop-blur-md text-amber-400 text-[11px] font-black px-2 py-0.5 rounded-lg flex items-center gap-1 border border-amber-500/20">
              <Star className="w-3 h-3 fill-amber-400" /> {item.rating}
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <h3
            onClick={onSelect}
            className="font-black text-base sm:text-lg text-white group-hover:text-[#FFC500] transition truncate cursor-pointer"
          >
            {item.name}
          </h3>

          <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-1.5 mb-3">
            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span className="truncate">{item.address || item.cityId || 'اليمن'}</span>
          </p>

          <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed mb-4">
            {item.description || 'منشأة معتمدة تقدم خدمات راقية ومتميزة لعملائها بأعلى معايير الجودة.'}
          </p>

          <div className="flex flex-wrap gap-1.5 mb-2">
            {feat.rooms_count > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800 text-amber-300 flex items-center gap-1">
                <Bed className="w-3 h-3" /> {feat.rooms_count} غرفة
              </span>
            )}
            {feat.has_pool && (
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                <Waves className="w-3 h-3" /> مسبح
              </span>
            )}
            {feat.has_wifi && (
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                <Wifi className="w-3 h-3" /> واي فاي
              </span>
            )}
            {feat.has_emergency && (
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1">
                <Stethoscope className="w-3 h-3" /> طوارئ 24 س
              </span>
            )}
            {feat.has_delivery && (
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <Truck className="w-3 h-3" /> توصيل
              </span>
            )}
            {feat.has_family_sections && (
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                <Users className="w-3 h-3" /> قسم عوائل
              </span>
            )}
            {feat.gold_carat && (
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 flex items-center gap-1">
                <Gem className="w-3 h-3" /> عيار {feat.gold_carat}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-3 bg-zinc-900/80 border-t border-zinc-800/80 flex items-center gap-2">
        {item.phone && (
          <a
            href={`tel:${item.phone}`}
            className="flex-1 text-center py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition border border-zinc-700"
          >
            <Phone className="w-3.5 h-3.5 text-blue-400" /> اتصال
          </a>
        )}
        {(item.whatsapp || item.phone) && (
          <a
            href={`https://wa.me/${(item.whatsapp || item.phone).replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 text-center py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition shadow-md"
          >
            <MessageCircle className="w-3.5 h-3.5" /> واتساب
          </a>
        )}
        <button
          onClick={onSelect}
          className="px-3.5 py-2 bg-[#FFC500] hover:bg-amber-400 text-zinc-950 font-black rounded-xl text-xs transition shadow-md shrink-0"
        >
          التفاصيل
        </button>
      </div>
    </div>
  );
}
