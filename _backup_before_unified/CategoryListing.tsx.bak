import React, { useState, useEffect, useMemo } from 'react';
import {
  Star, MapPin, Phone, ArrowRight, Frown, Layers, CheckCircle2,
  Bed, Wifi, Car, Stethoscope, Sparkles, Clock, Megaphone,
  ShieldCheck, Heart, Share2, ExternalLink, Loader2, Award,
  Utensils, Gem, Truck, Users, AlertCircle, Waves
} from 'lucide-react';
import { OFFICIAL_CATEGORIES } from '../../data/categories';
import { BusinessItem } from '../../data/mockData';
import { VerifiedBadge } from '../common/VerifiedBadge';
import { AdBanner } from '../common/AdBanner';
import { supabase } from '../../lib/supabase';

interface CategoryListingProps {
  categorySlug: string;
  businesses: BusinessItem[];
  selectedGov: string;
  selectedCity: string;
  onSelectBusiness: (business: BusinessItem) => void;
  onBackHome: () => void;
}

export const CategoryListing: React.FC<CategoryListingProps> = ({
  categorySlug,
  businesses,
  selectedGov,
  selectedCity,
  onSelectBusiness,
  onBackHome
}) => {
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [liveBusinesses, setLiveBusinesses] = useState<BusinessItem[]>([]);
  const [loadingLive, setLoadingLive] = useState(true);

  const category = OFFICIAL_CATEGORIES.find(c => c.slug === categorySlug);
  const Icon = category?.icon;
  const subcategories = category?.subcategories || [];

  // جلب المنشآت الحقيقية من Supabase
  useEffect(() => {
    const fetchLiveCategoryBusinesses = async () => {
      setLoadingLive(true);
      try {
        const { data: catRow } = await supabase
          .from('categories')
          .select('id, slug')
          .eq('slug', categorySlug)
          .single();

        let query = supabase.from('businesses').select('*');
        if (catRow) {
          query = query.eq('category_id', catRow.id);
        }
        query = query.eq('status', 'active').order('created_at', { ascending: false });

        const { data: bRows, error } = await query;
        if (error) throw error;

        if (bRows && bRows.length > 0) {
          const mapped: BusinessItem[] = bRows.map(b => ({
            id: b.id,
            name: b.name,
            slug: b.slug,
            categorySlug: categorySlug,
            subCategorySlug: b.sub_category || '',
            governorateId: b.city || '',
            cityId: b.city || '',
            logo: b.logo_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80',
            coverImage: b.cover_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&auto=format&fit=crop&q=80',
            images: Array.isArray(b.gallery_urls) && b.gallery_urls.length > 0 ? b.gallery_urls : [b.cover_url || ''],
            rating: Number(b.rating) || 4.8,
            reviewsCount: Number(b.review_count) || 6,
            isVerified: b.is_verified ?? true,
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
        } else {
          setLiveBusinesses([]);
        }
      } catch (err) {
        console.warn('Live fetch fallback to props:', err);
        setLiveBusinesses([]);
      } finally {
        setLoadingLive(false);
      }
    };

    fetchLiveCategoryBusinesses();
  }, [categorySlug]);

  const allList = liveBusinesses.length > 0
    ? liveBusinesses
    : businesses.filter(b => b.categorySlug === categorySlug);

  const filtered = useMemo(() => {
    return allList.filter(b => {
      const matchesSub = selectedSubCategory === 'all' || (b as any).subCategorySlug === selectedSubCategory;
      const matchesGov = selectedGov === 'all' || selectedGov === 'كل المحافظات' || b.governorateId === selectedGov;
      const matchesCity = selectedCity === 'all' || b.cityId === selectedCity;
      return matchesSub && matchesGov && matchesCity;
    });
  }, [allList, selectedSubCategory, selectedGov, selectedCity]);

  // تصنيف نوع النشاط
  const isHotelOrChalet = categorySlug.includes('hotel') || categorySlug.includes('chalet');
  const isMedical = categorySlug.includes('hospital') || categorySlug.includes('clinic') || categorySlug.includes('lab') || categorySlug.includes('pharmacy');
  const isRestaurantOrCafe = categorySlug.includes('restaurant') || categorySlug.includes('cafe') || categorySlug.includes('buffet');
  const isCarOrAuto = categorySlug.includes('car') || categorySlug.includes('motorcycle');
  const isGoldOrJewelry = categorySlug.includes('gold') || categorySlug.includes('jewelry');

  return (
    <div dir="rtl" className="space-y-6 max-w-6xl mx-auto px-2 sm:px-0">
      {/* 🌟 الوحدة الإعلانية 1: البنر العلوي الرئيسي (YR Ads Top Hero Unit) 🌟 */}
      <div className="w-full">
        <AdBanner placementId="1" className="mb-2 shadow-xl rounded-2xl overflow-hidden" />
      </div>

      {/* ترويسة التصنيف الرسمية */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3.5">
          {Icon && (
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black shadow-lg ${
              isHotelOrChalet
                ? 'bg-amber-400 text-zinc-950 shadow-amber-400/20'
                : isMedical
                ? 'bg-red-500 text-white shadow-red-500/20'
                : isRestaurantOrCafe
                ? 'bg-orange-500 text-white shadow-orange-500/20'
                : isCarOrAuto
                ? 'bg-blue-500 text-white shadow-blue-500/20'
                : isGoldOrJewelry
                ? 'bg-yellow-400 text-zinc-950 shadow-yellow-400/20'
                : 'bg-[#FFC500] text-black shadow-yellow-500/20'
            }`}>
              <Icon className="w-7 h-7" />
            </div>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              {category?.name || 'التصنيف'}
              {isMedical && (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1 font-bold">
                  <Stethoscope size={11} /> رعاية وطوارئ
                </span>
              )}
              {isHotelOrChalet && (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1 font-bold">
                  <Bed size={11} /> إقامة وسياحة
                </span>
              )}
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              دليل {category?.name || 'الأنشطة'} المعتمدة في اليمن مع التقييمات وتفاصيل الحجز والاتصال.
            </p>
          </div>
        </div>

        <button
          onClick={onBackHome}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-yellow-400 hover:text-yellow-300 hover:bg-zinc-800 transition-colors shadow-sm"
        >
          <ArrowRight className="w-4 h-4 text-amber-400" />
          <span>العودة للرئيسية</span>
        </button>
      </div>

      {/* شريط التصنيفات الفرعية */}
      {subcategories.length > 0 && (
        <div className="bg-zinc-900/70 border border-zinc-800 p-3.5 rounded-2xl space-y-2 shadow-md">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-bold">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>الأقسام الفرعية في {category?.name}:</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-nowrap sm:flex-wrap">
            <button
              onClick={() => setSelectedSubCategory('all')}
              className={`text-xs px-4 py-1.5 rounded-xl border font-bold transition-all shrink-0 ${
                selectedSubCategory === 'all'
                  ? 'bg-amber-400 text-zinc-950 border-amber-400 shadow-md'
                  : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              الكل
            </button>
            {subcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubCategory(sub.slug)}
                className={`text-xs px-3.5 py-1.5 rounded-xl border font-medium transition-all shrink-0 ${
                  selectedSubCategory === sub.slug
                    ? 'bg-amber-400 text-zinc-950 border-amber-400 font-bold shadow-md'
                    : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-amber-400/40'
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* شريط نتائج البحث والحالة الحية */}
      <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
        <div className="flex items-center gap-1.5">
          <span>تم العثور على</span>
          <strong className="text-amber-400 font-mono text-sm">{filtered.length}</strong>
          <span>منشأة مسجلة ومعتمدة</span>
        </div>
        {loadingLive && (
          <span className="flex items-center gap-1 text-amber-400/80 text-[11px]">
            <Loader2 size={12} className="animate-spin" /> جلب التحديثات الحية...
          </span>
        )}
      </div>

      {/* شبكة البطاقات النوعية الخالية من أي إيموجي (Listings Grid) */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item, index) => {
            const sec = (item as any).sectionsConfig || {};
            const feat = sec.features || {};

            return (
              <React.Fragment key={item.id}>
                <div
                  onClick={() => onSelectBusiness(item)}
                  className={`bg-zinc-950/90 border rounded-2xl overflow-hidden transition-all duration-200 flex flex-col group cursor-pointer shadow-xl relative ${
                    isHotelOrChalet
                      ? 'border-zinc-800 hover:border-amber-400/60'
                      : isMedical
                      ? 'border-zinc-800 hover:border-red-500/60'
                      : isRestaurantOrCafe
                      ? 'border-zinc-800 hover:border-orange-500/60'
                      : isCarOrAuto
                      ? 'border-zinc-800 hover:border-blue-500/60'
                      : 'border-zinc-800 hover:border-[#FFC500]/60'
                  }`}
                >
                  {/* الغلاف البانورامي والشارة الرسمية */}
                  <div className="relative h-48 w-full bg-zinc-900 overflow-hidden">
                    <img
                      src={item.coverImage || item.logo}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&auto=format&fit=crop&q=80'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />

                    {/* التقييم */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-zinc-950/85 backdrop-blur-md px-2.5 py-1 rounded-xl border border-zinc-800 text-xs font-black text-amber-400 shadow-md">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{item.rating || 4.8}</span>
                      <span className="text-zinc-500 text-[10px]">({item.reviewsCount || 0})</span>
                    </div>

                    {/* شارة التوثيق الثلاثية الرسمية (VerifiedBadge) */}
                    {item.isVerified && (
                      <div className="absolute top-3 left-3 bg-zinc-950/90 backdrop-blur-md border border-zinc-800 p-1.5 rounded-xl shadow-md flex items-center justify-center">
                        <VerifiedBadge type={item.badgeType || 'gold'} size="sm" />
                      </div>
                    )}

                    {/* شعار المنشأة */}
                    <div className="absolute -bottom-3 right-4 w-14 h-14 rounded-2xl bg-zinc-950 border-2 border-zinc-800 overflow-hidden shadow-2xl flex items-center justify-center">
                      <img
                        src={item.logo}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    </div>

                    {/* شارة الطوارئ للمستشفيات بأيقونة AlertCircle */}
                    {isMedical && (
                      <div className="absolute bottom-2 left-3">
                        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-red-600/90 text-white text-[10px] font-black shadow-lg animate-pulse">
                          <AlertCircle size={11} /> طوارئ 24 ساعة
                        </span>
                      </div>
                    )}
                  </div>

                  {/* التفاصيل والميزات بأيقونات المكتبة الحصرية */}
                  <div className="p-4 pt-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between gap-1.5">
                        <h3 className="font-extrabold text-base text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                          {item.name}
                        </h3>
                      </div>

                      <p className="text-xs text-zinc-400 flex items-center gap-1 mt-1 line-clamp-1">
                        <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        <span>{item.address}</span>
                      </p>

                      {/* ميزات الفنادق بأيقونات Lucide */}
                      {isHotelOrChalet && (
                        <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-amber-400 font-bold flex items-center gap-1">
                            <Bed size={12} /> {feat.rooms_count || 'أجنحة وغرف فندقية'}
                          </span>
                          <span className="px-2 py-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 flex items-center gap-1">
                            <Wifi size={12} className="text-amber-400" /> واي فاي مجاني
                          </span>
                          <span className="px-2 py-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 flex items-center gap-1">
                            <Waves size={12} className="text-amber-400" /> مسبح
                          </span>
                        </div>
                      )}

                      {/* ميزات المطاعم بأيقونات Lucide */}
                      {isRestaurantOrCafe && (
                        <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-orange-400 font-bold flex items-center gap-1">
                            <Users size={12} /> قسم عوائل مستقل
                          </span>
                          <span className="px-2 py-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 flex items-center gap-1">
                            <Truck size={12} /> توصيل سفري
                          </span>
                        </div>
                      )}

                      {/* ميزات معارض السيارات بأيقونات Lucide */}
                      {isCarOrAuto && (
                        <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-lg bg-blue-500/15 border border-blue-500/30 text-[11px] text-blue-400 font-bold flex items-center gap-1">
                            <ShieldCheck size={12} /> فحص وضمان معتمد
                          </span>
                        </div>
                      )}

                      {/* ميزات محلات الذهب بأيقونات Lucide */}
                      {isGoldOrJewelry && (
                        <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-lg bg-yellow-500/15 border border-yellow-500/30 text-[11px] text-yellow-400 font-bold flex items-center gap-1">
                            <Gem size={12} /> ذهب وسبائك معتمدة
                          </span>
                        </div>
                      )}

                      {/* حالة إثبات الملكية */}
                      {item.claimStatus === 'UNCLAIMED' && (
                        <div className="mt-2.5 pt-2 border-t border-zinc-900 flex items-center justify-between text-[11px]">
                          <span className="text-amber-400/90 font-bold flex items-center gap-1">
                            <ShieldCheck size={12} /> صفحة معتمدة
                          </span>
                          <span className="text-zinc-500 text-[10px]">جاهزة لإثبات الملكية</span>
                        </div>
                      )}
                    </div>

                    {/* زر الإجراء */}
                    <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80">
                      {item.phone ? (
                        <span className="text-xs font-mono text-zinc-300 flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-amber-400" />
                          <span>{item.phone}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-500">اليمن</span>
                      )}

                      <span className={`text-xs font-bold transition-colors flex items-center gap-1 ${
                        isHotelOrChalet
                          ? 'text-amber-400 group-hover:text-amber-300'
                          : isMedical
                          ? 'text-red-400 group-hover:text-red-300'
                          : isRestaurantOrCafe
                          ? 'text-orange-400 group-hover:text-orange-300'
                          : 'text-[#FFC500] group-hover:text-yellow-300'
                      }`}>
                        {isHotelOrChalet
                          ? 'استعلام وحجز إقامة'
                          : isMedical
                          ? 'طوارئ واستشارة فورية'
                          : isRestaurantOrCafe
                          ? 'عرض المنيو والطلب'
                          : 'التفاصيل الكاملة'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 🌟 الوحدة الإعلانية 2: الإعلان المضمن بين البطاقات (In-Feed Sponsor Ad) 🌟 */}
                {index === 1 && (
                  <div className="col-span-1 md:col-span-2 lg:col-span-3 my-2">
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-900 border border-amber-400/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-amber-400/10 text-amber-400 shrink-0">
                          <Megaphone className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase tracking-wider font-black px-2 py-0.5 rounded bg-amber-400 text-black">
                              إعلان مميز (YR Ads)
                            </span>
                            <h4 className="font-bold text-sm text-white">هل تمتلك منشأة في قطاع {category?.name}؟</h4>
                          </div>
                          <p className="text-xs text-zinc-400 mt-0.5">
                            انضم إلى دليل YEMEN RATING المعتمد واحصل على شارة التوثيق والوصول لآلاف الزوار يومياً.
                          </p>
                        </div>
                      </div>
                      <a
                        href="/admin"
                        className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs shrink-0 shadow-lg transition-all"
                      >
                        وثّق منشأتك الآن
                      </a>
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-zinc-900/30 border border-zinc-800 rounded-3xl p-8 space-y-3.5 shadow-xl">
          <Frown className="w-12 h-12 text-zinc-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">لا توجد منشآت مسجلة حالياً في {category?.name || 'هذا التصنيف'}</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
            سياسة منصة YEMEN RATING تتيح تسجيل واعتماد المنشآت وتجهيز صفحاتها الرسمية لتكون جاهزة للمطالبة بالملكية.
          </p>
          <button
            onClick={onBackHome}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-amber-400 font-bold text-xs hover:bg-zinc-800 transition-colors"
          >
            <ArrowRight size={14} /> تصفح بقية الأقسام
          </button>
        </div>
      )}

      {/* 🌟 الوحدة الإعلانية 3: البنر السفلي الثابت (Sticky Bottom Ad Banner) 🌟 */}
      <div className="pt-6">
        <AdBanner placementId="2" className="shadow-xl rounded-2xl overflow-hidden" />
      </div>
    </div>
  );
};
