import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search, MapPin, ArrowRight, Star,
  Loader2, Frown, Store, ShieldCheck
} from 'lucide-react';
import { AdBanner } from '../../../components/common/AdBanner';
import { OFFICIAL_CATEGORIES } from '../../../data/categories';
import { supabase } from '../../../lib/supabase';


function OfficialVerifiedBadge({ type = 'gold', size = 18 }: { type?: string; size?: number }) {
  let badgeColor = '#FFC500';
  if (type === 'blue') badgeColor = '#1D9BF0';
  if (type === 'silver' || type === 'gray') badgeColor = '#9CA3AF';

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


export const BusinessesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'all';

  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const currentCategory = OFFICIAL_CATEGORIES.find(c => c.slug === categoryParam);
  const CategoryIcon = currentCategory?.icon || Store;

  useEffect(() => {
    let isMounted = true;
    const fetchCategoryBusinesses = async () => {
      setLoading(true);
      try {
        let query = supabase.from('businesses').select('*');

        if (categoryParam !== 'all') {
          const { data: catRow } = await supabase
            .from('categories')
            .select('id, slug')
            .eq('slug', categoryParam)
            .maybeSingle();

          if (catRow && catRow.id) {
            query = query.eq('category_id', catRow.id);
          } else {
            query = query.eq('category_id', categoryParam);
          }
        }

        const { data, error } = await query
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (!error && data && isMounted) {
          setBusinesses(data);
        } else if (isMounted) {
          setBusinesses([]);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        if (isMounted) setBusinesses([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCategoryBusinesses();
    return () => { isMounted = false; };
  }, [categoryParam]);

  const filtered = useMemo(() => {
    return businesses.filter(b => {
      const matchCity = selectedCity === 'all' || (b.city && b.city.includes(selectedCity)) || (b.address && b.address.includes(selectedCity));
      const matchSearch = !searchQuery.trim() ||
        (b.name && b.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (b.address && b.address.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCity && matchSearch;
    });
  }, [businesses, selectedCity, searchQuery]);

  return (
    <div dir="rtl" className="max-w-6xl mx-auto px-3 sm:px-4 py-2 space-y-3 font-['Cairo',sans-serif] text-zinc-100">
      <AdBanner placementId="1" className="mb-2" />

      {/* رأس الصفحة النظيف */}
      <div className="flex items-center justify-between border-b border-[#1F2937] pb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#FFC500] text-black flex items-center justify-center font-black shadow-md shadow-[#FFC500]/20">
            <CategoryIcon className="w-4 h-4 stroke-[2.5]" />
          </div>
          <h1 className="text-base sm:text-lg font-bold text-white">
            {currentCategory ? currentCategory.name : 'دليل المنشآت'}
          </h1>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold transition border border-[#1F2937]"
        >
          <span>رجوع</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* شريط البحث والمدينة */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="sm:col-span-2 relative">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0E1422] border border-[#1F2937] focus:border-[#FFC500] text-zinc-100 placeholder-zinc-500 pr-9 pl-3 py-2 rounded-xl text-xs outline-none transition"
          />
        </div>

        <div>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full bg-[#0E1422] border border-[#1F2937] focus:border-[#FFC500] text-zinc-300 px-3 py-2 rounded-xl text-xs outline-none transition"
          >
            <option value="all">كل المدن والمحافظات</option>
            <option value="صنعاء">صنعاء</option>
            <option value="عدن">عدن</option>
            <option value="تعز">تعز</option>
            <option value="الحديدة">الحديدة</option>
            <option value="حضرموت">حضرموت</option>
            <option value="إب">إب</option>
            <option value="ذمار">ذمار</option>
            <option value="مأرب">مأرب</option>
          </select>
        </div>
      </div>

      {/* قائمة البطاقات المطابقة لكروت البنوك بالملي */}
      {loading ? (
        <div className="py-16 text-center flex flex-col items-center justify-center">
          <Loader2 className="w-7 h-7 animate-spin text-[#FFC500] mb-2" />
          <p className="text-xs text-zinc-500">جاري التحميل...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-14 text-center text-zinc-500">
          <Frown className="w-10 h-10 mx-auto text-zinc-600 mb-2 stroke-[1.5]" />
          <p className="text-xs">لا توجد منشآت مضافة في هذا القسم</p>
        </div>
      ) : (
        <div className="space-y-4 pt-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.slice(0, 3).map((item) => (
              <BankCardView key={item.id} item={item} onSelect={() => navigate('/businesses/' + (item.slug || item.id))} />
            ))}
          </div>

          <AdBanner placementId="2" className="my-3" />

          {filtered.length > 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.slice(3).map((item) => (
                <BankCardView key={item.id} item={item} onSelect={() => navigate('/businesses/' + (item.slug || item.id))} />
              ))}
            </div>
          )}
        </div>
      )}

      <AdBanner placementId="3" className="mt-4" />
    </div>
  );
};

function BankCardView({ item, onSelect }: { item: any; onSelect: () => void }) {
  const isVerified = item.is_verified === true;
  // التقييم يظهر فقط إن كان حقيقياً ومسجلاً
  const reviewCount = Number(item.review_count) || 0;
  const ratingValue = Number(item.rating) || 0;
  const hasRealRating = Number(item.review_count) > 0 && Number(item.rating) > 0;

  return (
    <article
      onClick={onSelect}
      className="bg-[#0B0F17] border border-zinc-800/90 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between transition hover:border-zinc-700 cursor-pointer group"
    >
      <div>
        {/* الغلاف */}
        <div className="relative w-full h-44 sm:h-52 bg-gradient-to-r from-[#002244] via-[#003B73] to-[#0A4D80] flex items-center justify-center overflow-hidden">
          {item.cover_url ? (
            <img src={item.cover_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">لا يوجد غلاف</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-transparent to-transparent" />
        </div>

        {/* الشعار متداخل باليمين وزر إثبات الملكية باليسار */}
        <div className="px-4 relative flex items-end justify-between -mt-8 mb-2">
          <div className="relative z-10 order-1">
            <div className="w-16 h-16 rounded-2xl shadow-2xl border-2 border-black flex items-center justify-center overflow-hidden shrink-0 bg-[#0B0F17]">
              {item.logo_url ? (
                <img src={item.logo_url} alt={item.name} className="w-full h-full object-contain p-1" />
              ) : (
                <Store className="w-7 h-7 text-zinc-600" />
              )}
            </div>
          </div>

          <div className="order-2 mb-1">
            {!isVerified && (
              <a
                href={`https://wa.me/967770000000?text=${encodeURIComponent('طلب إثبات ملكية المنشأة: ' + item.name)}`}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 bg-[#EF4444] hover:bg-red-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-lg transition active:scale-95 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>إثبات الملكية</span>
              </a>
            )}
          </div>
        </div>

        {/* الاسم + الشارة المعتمدة فقط */}
        <div className="px-4 pt-1 pb-3 text-right space-y-1.5">
          <div className="inline-flex items-center gap-1.5 flex-wrap">
            <h2 className="text-sm sm:text-base font-black text-white leading-tight group-hover:text-[#FFC500] transition">
              {item.name}
            </h2>
            {isVerified && <OfficialVerifiedBadge type={item.badge_type || 'gold'} size={18} />}
          </div>

          {/* التقييم الواقعي فقط بدون أي أرقام من الرأس */}
          {hasRealRating ? (
            <div className="flex items-center gap-1.5 text-xs text-[#FFC500] font-bold">
              <span className="text-white font-medium text-[11px]">★التقييمات</span>
              <Star className="w-3.5 h-3.5 fill-[#FFC500]" />
              <span className="text-white text-sm font-black">{ratingValue.toFixed(1)}</span>
              <span className="text-zinc-400 font-normal text-[11px]">({reviewCount} تقييم)</span>
            </div>
          ) : (
            <div className="text-right pt-0.5">
              <span className="text-zinc-500 text-xs">لا توجد تقييمات بعد</span>
            </div>
          )}

          {/* الوصف */}
          {item.description && (
            <p className="text-xs text-zinc-300 leading-relaxed pt-1 line-clamp-2">
              {item.description}
            </p>
          )}

          {/* المدينة والعنوان */}
          {(item.city || item.address) && (
            <div className="flex items-center justify-start gap-1 text-xs text-zinc-400 pt-1">
              <MapPin className="w-3.5 h-3.5 text-[#FFC500] shrink-0" />
              <span>{item.address || item.city}</span>
            </div>
          )}
        </div>
      </div>

      {/* الزر الذهبي الفاخر الموحد */}
      <div className="p-4 pt-1">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          className="w-full py-2.5 rounded-xl bg-[#FFC500] hover:bg-amber-400 text-black font-black text-sm flex items-center justify-center gap-2 shadow transition active:scale-98 cursor-pointer"
        >
          <span>عرض صفحة المنشأة</span>
          <ArrowRight className="w-4 h-4 rtl:rotate-180" />
        </button>
      </div>
    </article>
  );
}
