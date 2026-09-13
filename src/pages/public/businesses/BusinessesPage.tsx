import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Search, MapPin, Star, ArrowRight, Loader2, Frown, Sparkles,
  Utensils, Bed, Stethoscope, Truck, GraduationCap, Building, ShieldCheck,
  ChevronDown, Store, ShoppingBag, Car, Scissors, Gem, HeartPulse, Check
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { AdBanner } from '../../../components/common/AdBanner';

function OfficialVerifiedBadge({ type = "gold", size = 18 }: { type?: string; size?: number }) {
  let badgeColor = "#EAB308";
  if (type === "blue") badgeColor = "#1D9BF0";
  if (type === "silver" || type === "gray") badgeColor = "#9CA3AF";

  return (
    <svg
      className="inline-block select-none shrink-0 align-middle"
      style={{ width: size, height: size, color: badgeColor }}
      viewBox="0 0 24 24"
      title="موثق رسمياً"
    >
      <path
        d="M22.5 12.5c0-1.58-.88-2.95-2.15-3.6.15-.44.24-.91.24-1.4 0-2.21-1.79-4-4-4-.49 0-.96.08-1.4.24C14.55 2.48 13.18 1.6 11.6 1.6c-1.58 0-2.95.88-3.6 2.15-.44-.16-.91-.25-1.4-.25-2.21 0-4 1.79-4 4 0 .49.08.96.24 1.4C1.58 9.55.7 10.92.7 12.5c0 1.58.88 2.95 2.15 3.6-.16.44-.25.91-.25 1.4 0 2.21 1.79 4 4 4 .49 0 .96-.08 1.4-.24.65 1.27 2.02 2.14 3.6 2.14 1.58 0 2.95-.87 3.6-2.14.44.16.91.24 1.4.24 2.21 0 4-1.79 4-4 0-.49-.08-.96-.24-1.4 1.27-.65 2.14-2.02 2.14-3.6z"
        fill="currentColor"
      />
      <path
        d="M10.2 16.2l-3.5-3.5 1.4-1.4 2.1 2.1 5.9-5.9 1.4 1.4-7.3 7.3z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

export const CATEGORY_CONFIG: { [slug: string]: { name: string; icon: any } } = {
  'transport': { name: 'شركات النقل', icon: Truck },
  'hospitals': { name: 'المستشفيات', icon: HeartPulse },
  'clinics': { name: 'العيادات', icon: Stethoscope },
  'pharmacies': { name: 'الصيدليات', icon: Stethoscope },
  'laboratories': { name: 'المختبرات', icon: Stethoscope },
  'restaurants': { name: 'المطاعم والأغذية', icon: Utensils },
  'cafes': { name: 'الكافيهات', icon: Utensils },
  'buffets': { name: 'البوفيهات', icon: Utensils },
  'hotels': { name: 'الفنادق', icon: Bed },
  'chalets': { name: 'الشاليهات', icon: Bed },
  'supermarkets': { name: 'السوبرماركت', icon: Store },
  'malls': { name: 'المولات', icon: Building },
  'shopping-centers': { name: 'مراكز التسوق', icon: ShoppingBag },
  'shops': { name: 'المحلات والمتاجر', icon: Store },
  'car-dealerships': { name: 'معارض السيارات', icon: Car },
  'motorcycle-dealerships': { name: 'معارض الدراجات النارية', icon: Car },
  'cleaning-companies': { name: 'شركات التنظيف', icon: Sparkles },
  'universities': { name: 'الجامعات', icon: GraduationCap },
  'schools': { name: 'المدارس', icon: GraduationCap },
  'parks': { name: 'الحدائق', icon: Sparkles },
  'wedding-halls': { name: 'صالات الأفراح', icon: Sparkles },
  'barbershops': { name: 'الحلاقون', icon: Scissors },
  'beauty-salons': { name: 'الكوافير', icon: Sparkles },
  'saunas': { name: 'الحمامات البخارية', icon: Sparkles },
  'clothing-shoes': { name: 'محلات الملابس والأحذية', icon: ShoppingBag },
  'jewelry-gold': { name: 'محلات الذهب', icon: Gem },
  'poultry-farms': { name: 'مزارع الدواجن', icon: Building },
  'optics-hearing': { name: 'البصريات والسمعيات', icon: Stethoscope }
};

const CITIES_LIST = [
  { id: 'all', name: 'كل المدن والمحافظات' },
  { id: 'صنعاء', name: 'صنعاء' },
  { id: 'عدن', name: 'عدن' },
  { id: 'تعز', name: 'تعز' },
  { id: 'الحديدة', name: 'الحديدة' },
  { id: 'حضرموت', name: 'حضرموت' },
  { id: 'إب', name: 'إب' },
  { id: 'ذمار', name: 'ذمار' },
  { id: 'مأرب', name: 'مأرب' }
];

export const BusinessesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentCategorySlug = searchParams.get('category') || 'transport';
  const categoryConfig = CATEGORY_CONFIG[currentCategorySlug] || { name: 'المنشآت المعتمدة', icon: Building };
  const CategoryIcon = categoryConfig.icon;

  const [businesses, setBusinesses] = useState<any[]>([]);
  const [realReviewsMap, setRealReviewsMap] = useState<Map<string, { count: number; avg: number }>>(new Map());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target as Node)) {
        setCityDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchCategoryData = async () => {
      // 1. كاش فوري: عرض المنشآت والتقييمات فوراً في 0.01 ثانية
      const cacheKey = "yr_swr_biz_" + currentCategorySlug;
      try {
        const cached = localStorage.getItem(cacheKey);
        const cachedRevs = localStorage.getItem("yr_swr_revs");
        if (cached) {
          setBusinesses(JSON.parse(cached));
          if (cachedRevs) {
            setRealReviewsMap(new Map(JSON.parse(cachedRevs)));
          }
          setLoading(false);
        }
      } catch (_) {}
      try {
        const { data: catData } = await supabase.from('categories').select('id, name, slug');
        const matchedCat = (catData || []).find(
          c => c.slug === currentCategorySlug || c.id === currentCategorySlug || c.name === currentCategorySlug
        );

        let query = supabase.from('businesses').select('*');

        if (matchedCat) {
          query = query.eq('category_id', matchedCat.id);
        } else {
          query = query.or(`sub_category.eq.${currentCategorySlug},category_id.eq.${currentCategorySlug}`);
        }

        query = query.or('status.eq.active,status.eq.ACTIVE,status.is.null');

        const [bizRes, revRes] = await Promise.all([
          query.order('is_verified', { ascending: false }),
          supabase.from('reviews').select('entity_id, stars')
        ]);

        const revMap = new Map<string, { count: number; avg: number }>();
        if (revRes.data && Array.isArray(revRes.data)) {
          const grouped = new Map<string, number[]>();
          revRes.data.forEach((r: any) => {
            if (r.entity_id) {
              const arr = grouped.get(r.entity_id) || [];
              const s = Number(r.stars);
              if (s >= 1 && s <= 5) arr.push(s);
              grouped.set(r.entity_id, arr);
            }
          });

          grouped.forEach((starsArr, entId) => {
            const count = starsArr.length;
            const avg = Number((starsArr.reduce((a, b) => a + b, 0) / count).toFixed(1));
            revMap.set(entId, { count, avg });
          });
        }
        setRealReviewsMap(revMap);

        if (!bizRes.error && bizRes.data) {
          setBusinesses(bizRes.data);
          try {
            localStorage.setItem(cacheKey, JSON.stringify(bizRes.data));
            localStorage.setItem("yr_swr_revs", JSON.stringify(Array.from(revMap.entries())));
          } catch (_) {}
        }
      } catch (err) {
        console.error('Error fetching category data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [currentCategorySlug]);

  const filtered = businesses.filter((item) => {
    const matchesSearch = !searchQuery.trim() || 
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = selectedCity === 'all' || item.city === selectedCity;
    return matchesSearch && matchesCity;
  });

  const selectedCityName = CITIES_LIST.find(c => c.id === selectedCity)?.name || 'كل المدن والمحافظات';

  return (
    <div dir="rtl" className="min-h-screen bg-[#070A10] text-white font-['Cairo',sans-serif] pb-16 px-3 sm:px-4 max-w-7xl mx-auto pt-3">
      {/* 1. الترويسة المعتمدة: اسم الصنف في اليمين بالكامل، وزر الرجوع باليسار يرجع للرئيسية */}
      <div className="mb-4 flex items-center justify-between border-b border-[#1F2937]/70 pb-3">
        {/* اليمين: عنوان الصنف النظيف */}
        <div className="flex items-center gap-2 text-right">
          <CategoryIcon className="w-6 h-6 text-[#EAB308] shrink-0" />
          <h1 className="text-xl sm:text-2xl font-black text-white leading-none">
            دليل {categoryConfig.name}
          </h1>
        </div>

        {/* اليسار: زر رجوع شفاف متجه لليمين يرجع للرئيسية إلزامي */}
        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-[#EAB308] hover:text-white p-1.5 bg-transparent border-0 transition cursor-pointer active:scale-90 flex items-center justify-center"
          title="الرئيسية"
          aria-label="الرئيسية"
        >
          <ArrowRight size={24} strokeWidth={2.5} />
        </button>
      </div>

      {/* 2. البحث وقائمة المدن المخصصة بالكامل بهوية الموقع الفاخرة الداكنة */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4 bg-[#0B0F17] p-2.5 rounded-2xl border border-[#1F2937]">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={`ابحث في ${categoryConfig.name}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#121620] border border-[#1F2937] focus:border-[#EAB308] text-zinc-200 pr-10 pl-3 py-2.5 rounded-xl text-xs outline-none transition"
          />
        </div>

        {/* القائمة المنسدلة المخصصة للمدن بهوية يمن ريتنغ الداكنة */}
        <div className="relative" ref={cityDropdownRef}>
          <button
            type="button"
            onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
            className="w-full bg-[#121620] hover:bg-[#161D2B] border border-[#1F2937] focus:border-[#EAB308] text-zinc-200 px-3.5 py-2.5 rounded-xl text-xs outline-none transition cursor-pointer flex items-center justify-between font-bold"
          >
            <span className="truncate">{selectedCityName}</span>
            <ChevronDown className={`w-4 h-4 text-[#EAB308] transition-transform duration-200 ${cityDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {cityDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1.5 z-40 bg-[#0B0F17] border border-[#1F2937] rounded-xl shadow-2xl p-1.5 max-h-60 overflow-y-auto space-y-0.5 text-right">
              {CITIES_LIST.map((city) => {
                const isSelected = selectedCity === city.id;
                return (
                  <div
                    key={city.id}
                    onClick={() => {
                      setSelectedCity(city.id);
                      setCityDropdownOpen(false);
                    }}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                      isSelected 
                        ? 'bg-[#EAB308]/15 text-[#EAB308]' 
                        : 'text-zinc-300 hover:bg-[#121620] hover:text-white'
                    }`}
                  >
                    <span>{city.name}</span>
                    {isSelected && <Check size={14} className="text-[#EAB308]" />}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* قائمة البطاقات */}
      {loading ? (
        <div className="py-16 text-center flex flex-col items-center justify-center">
          <Loader2 className="w-7 h-7 animate-spin text-[#EAB308] mb-2" />
          <p className="text-xs text-zinc-400 font-bold">جاري التحميل...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-zinc-500 bg-[#0B0F17] rounded-2xl border border-[#1F2937]">
          <Frown className="w-10 h-10 mx-auto text-zinc-600 mb-2 stroke-[1.5]" />
          <p className="text-xs font-bold">لا توجد منشآت مضافة في هذا التصنيف حالياً</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item, idx) => (
            <React.Fragment key={item.id}>
              {idx === 2 && (
                <div className="col-span-full my-2">
                  <AdBanner placementId="3" className="rounded-2xl overflow-hidden shadow-md" />
                </div>
              )}
            <CleanBankStyleCard 
              key={item.id} 
              item={item} 
              realReview={realReviewsMap.get(item.id)}
              onSelect={() => {
                try {
                  localStorage.setItem("yr_instant_entity_" + (item.slug || item.id), JSON.stringify(item));
                } catch (_) {}
                window.location.href = "/bank.html?slug=" + (item.slug || item.id);
              }} 
            />
          </React.Fragment>
              ))}
        </div>
      )}

      <AdBanner placementId="3" className="mt-6 rounded-2xl overflow-hidden shadow-lg" />
    </div>
  );
};

function CleanBankStyleCard({ item, realReview, onSelect }: { item: any; realReview?: { count: number; avg: number }; onSelect: () => void }) {
  const isVerified = item.is_verified === true;
  
  const hasRealRating = realReview && realReview.count > 0;
  const ratingValue = hasRealRating ? realReview.avg : 0;
  const reviewCount = hasRealRating ? realReview.count : 0;

  return (
    <article
      onClick={onSelect}
      className="bg-[#0B0F17] border border-zinc-800/90 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between transition hover:border-zinc-700 cursor-pointer"
    >
      <div>
        {/* الغلاف الرسمي */}
        <div className="relative w-full h-40 bg-gradient-to-r from-[#0D2137] via-[#102A45] to-[#0A192B] flex items-center justify-center overflow-hidden">
          {item.cover_url ? (
            <img 
              src={item.cover_url} 
              alt={item.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
          ) : (
            <div className="text-center px-4">
              <h2 className="text-[#EAB308] text-lg font-black tracking-wide leading-tight">{item.name}</h2>
              <p className="text-zinc-400 text-[11px] mt-0.5 font-medium">{item.city || 'اليمن'}</p>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-transparent to-transparent opacity-80" />
        </div>

        {/* سطر التداخل: الشعار في اليمين وزر إثبات الملكية في اليسار */}
        <div className="px-4 relative flex items-start justify-between -mt-7 mb-2">
          {/* الشعار المعتمد: خلفية داكنة بدون أي ستروك أبيض */}
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-[#0B0F17] shadow-2xl border-2 border-[#1F2937] flex items-center justify-center overflow-hidden shrink-0">
              {item.logo_url ? (
                <img src={item.logo_url} alt={item.name} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <Building className="w-8 h-8 text-[#EAB308]" />
              )}
            </div>
          </div>

          {/* زر المطالبة بالملكية: ينقل للصفحة الفردية وتفتح له نافذة المطالبة مباشرة بدلاً من الواتس */}
          <div>
            {item.ownership_status !== 'VERIFIED' && item.claim_status !== 'APPROVED' && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = "/bank.html?slug=" + (item.slug || item.id) + "&claim=1";
                }}
                className="inline-flex items-center gap-1.5 bg-[#2A0E0E] hover:bg-[#3D1414] border border-[#661F1F] text-[#F87171] text-xs font-bold px-3 py-1.5 rounded-full shadow-md transition active:scale-95 cursor-pointer mt-3"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#EF4444]" />
                <span>إثبات ملكية الصفحة</span>
              </button>
            )}
          </div>
        </div>

        {/* تفاصيل المنشأة */}
        <div className="px-4 pt-1 pb-3 text-right space-y-1.5">
          {/* الاسم + الشارة */}
          <div className="flex items-center justify-start gap-1.5">
            <h2 className="text-base font-black text-white leading-tight">
              {item.name}
            </h2>
            {isVerified && <OfficialVerifiedBadge type={item.badge_type || 'gold'} size={18} />}
          </div>

          {/* المقر والمدينة */}
          {(item.city || item.address) && (
            <div className="flex items-center justify-start gap-1 text-xs text-zinc-400">
              <MapPin size={12} className="text-[#EAB308] shrink-0" />
              <span>{item.address || item.city}</span>
            </div>
          )}

          {/* التقييم الواقعي فقط */}
          {hasRealRating ? (
            <div className="flex items-center justify-start gap-1.5 text-xs font-bold pt-0.5">
              <Star size={13} className="text-[#EAB308] fill-[#EAB308]" />
              <span className="text-white font-mono">{ratingValue.toFixed(1)}</span>
              <span className="text-zinc-400 text-[11px] font-normal">({reviewCount} تقييم)</span>
            </div>
          ) : (
            <div className="text-right pt-0.5">
              <span className="text-zinc-500 text-xs font-normal">لا توجد تقييمات بعد</span>
            </div>
          )}

          {/* النبذة */}
          {item.description && (
            <p className="text-xs text-zinc-300 leading-relaxed pt-1 line-clamp-2">
              {item.description}
            </p>
          )}
        </div>
      </div>

      {/* زر عرض صفحة المنشأة */}
      <div className="p-4 pt-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className="w-full py-2.5 rounded-xl bg-[#EAB308] hover:bg-[#CA8A04] text-black font-black text-sm flex items-center justify-center gap-2 shadow transition active:scale-98 cursor-pointer"
        >
          <span>عرض صفحة المنشأة</span>
          <ArrowRight size={14} className="rtl:rotate-180" />
        </button>
      </div>
    </article>
  );
}
