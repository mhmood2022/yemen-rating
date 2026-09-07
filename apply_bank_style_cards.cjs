const fs = require('fs');

// 1. كود SVG الموحد للشارات الثلاث المعتمدة (ذهبي - أزرق - فضي)
const badgeHelper = `
function VerifiedRosette({ type = 'gold', size = 18 }: { type?: string; size?: number }) {
  let fillColor = '#FFC500';
  if (type === 'blue') fillColor = '#2BA6FF';
  if (type === 'silver' || type === 'gray') fillColor = '#9CA3AF';

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block shrink-0 align-middle">
      <path
        d="M12 1.5l1.6 1.7 2.3-.3 1.1 2.1 2.3.6.3 2.3 2 1.3-.5 2.3 1.4 1.9-1.3 2 .5 2.3-2 1.3-.3 2.3-2.3.6-1.1 2.1-2.3-.3-1.6 1.7-1.6-1.7-2.3.3-1.1-2.1-2.3-.6-.3-2.3-2-1.3.5-2.3-1.4-1.9 1.3-2-.5-2.3 2-1.3.3-2.3 2.3-.6 1.1-2.1 2.3.3L12 1.5z"
        fill={fillColor}
      />
      <path
        d="M8.5 12l2.5 2.5 5-5"
        stroke="#FFFFFF"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
`;

// 2. تحديث BusinessesPage.tsx ببطاقات تطابق ستايل البنوك 100%
const businessesPageCode = `import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search, MapPin, Phone, ArrowRight, Star,
  Bed, Wifi, Car, Truck, Users, Gem, Waves,
  Loader2, Frown, Stethoscope, Store, MessageCircle, ShieldCheck
} from 'lucide-react';
import { AdBanner } from '../../../components/common/AdBanner';
import { OFFICIAL_CATEGORIES } from '../../../data/categories';
import { supabase } from '../../../lib/supabase';

${badgeHelper}

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

      {/* ترويسة الصفحة النظيفة دون أي مساس */}
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

      {/* البحث وفلتر المدينة */}
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

      {/* شبكة البطاقات بستايل البنوك الفاخر */}
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
              <BankStyleCard
                key={item.id}
                item={item}
                categorySlug={categoryParam}
                onSelect={() => navigate('/businesses/' + (item.slug || item.id))}
              />
            ))}
          </div>

          <AdBanner placementId="2" className="my-3" />

          {filtered.length > 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.slice(3).map((item) => (
                <BankStyleCard
                  key={item.id}
                  item={item}
                  categorySlug={categoryParam}
                  onSelect={() => navigate('/businesses/' + (item.slug || item.id))}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <AdBanner placementId="3" className="mt-4" />
    </div>
  );
};

// مكون البطاقة المطابق تماماً لبطاقات البنوك في الصورة 4
function BankStyleCard({ item, categorySlug, onSelect }: { item: any; categorySlug: string; onSelect: () => void }) {
  const feat = item.sections_config?.features || {};
  const hasRating = Number(item.rating) > 0 && Number(item.review_count) > 0;
  const isVerified = item.is_verified === true;

  // التحقق الذكي من الفئات لعدم خلط حقول الذهب أو الغرف مع النقل
  const isHotel = categorySlug.includes('hotel') || categorySlug.includes('chalet');
  const isMedical = categorySlug.includes('hospital') || categorySlug.includes('clinic') || categorySlug.includes('lab') || categorySlug.includes('pharmacy');
  const isFood = categorySlug.includes('restaurant') || categorySlug.includes('cafe') || categorySlug.includes('buffet');
  const isJewelry = categorySlug.includes('gold') || categorySlug.includes('jewelry');

  return (
    <article
      onClick={onSelect}
      className="bg-[#0B0F17] border border-zinc-800/90 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between transition hover:border-zinc-700 cursor-pointer group"
    >
      <div>
        {/* 1. الغلاف البانورامي مع التدرج */}
        <div className="relative w-full h-44 sm:h-48 bg-gradient-to-r from-[#002244] via-[#003B73] to-[#0A4D80] flex items-center justify-center overflow-hidden">
          {item.cover_url ? (
            <img src={item.cover_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">لا يوجد غلاف</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-transparent to-transparent" />
        </div>

        {/* 2. الشعار باليمين متداخل (-mt-8) وزر إثبات الملكية باليسار */}
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
                href={\`https://wa.me/967770000000?text=\${encodeURIComponent('طلب إثبات ملكية المنشأة: ' + item.name)}\`}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 bg-[#EF4444] hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg transition active:scale-95 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>إثبات الملكية</span>
              </a>
            )}
          </div>
        </div>

        {/* 3. الاسم + الشارة المعتمدة الرسمية الثلاثية */}
        <div className="px-4 pt-1 pb-3 text-right space-y-1.5">
          <div className="inline-flex items-center gap-1.5 flex-wrap">
            <h2 className="text-sm sm:text-base font-black text-white leading-tight group-hover:text-[#FFC500] transition">
              {item.name}
            </h2>
            {isVerified && <VerifiedRosette type={item.badge_type || 'gold'} size={18} />}
          </div>

          {/* 4. التقييم المصغر */}
          {hasRating ? (
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{Number(item.rating).toFixed(1)}</span>
              <span className="text-zinc-500 font-normal">({item.review_count} تقييم)</span>
            </div>
          ) : (
            <div className="text-right pt-0.5">
              <span className="text-zinc-500 text-xs">لا توجد تقييمات بعد</span>
            </div>
          )}

          {/* 5. الوصف المختصر */}
          {item.description && (
            <p className="text-xs text-zinc-300 leading-relaxed pt-1 line-clamp-2">
              {item.description}
            </p>
          )}

          {/* 6. العنوان والمدينة */}
          {(item.city || item.address) && (
            <div className="flex items-center justify-start gap-1 text-xs text-zinc-400 pt-1">
              <MapPin className="w-3.5 h-3.5 text-[#FFC500] shrink-0" />
              <span>{item.address || item.city}</span>
            </div>
          )}

          {/* 7. الميزات التابعة حصراً لنوع النشاط المحدد دون أي خلط */}
          <div className="flex flex-wrap gap-1 pt-1">
            {isHotel && feat.rooms_count > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 text-amber-300 border border-zinc-800 flex items-center gap-1">
                <Bed className="w-3 h-3" /> {feat.rooms_count} غرفة
              </span>
            )}
            {isHotel && feat.has_pool && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                <Waves className="w-3 h-3" /> مسبح
              </span>
            )}
            {isMedical && feat.has_emergency && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1">
                <Stethoscope className="w-3 h-3" /> طوارئ 24 س
              </span>
            )}
            {isFood && feat.has_delivery && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <Truck className="w-3 h-3" /> توصيل
              </span>
            )}
            {isFood && feat.has_family_sections && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                <Users className="w-3 h-3" /> عوائل
              </span>
            )}
            {isJewelry && feat.gold_carat && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 flex items-center gap-1">
                <Gem className="w-3 h-3" /> عيار {feat.gold_carat}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 8. الزر الذهبي الفخم المطابق للبطاقة الرسمية */}
      <div className="p-4 pt-1 space-y-2">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          className="w-full py-2.5 rounded-xl bg-[#FFC500] hover:bg-amber-400 text-black font-black text-sm flex items-center justify-center gap-2 shadow transition active:scale-98 cursor-pointer"
        >
          <span>عرض صفحة المنشأة</span>
          <ArrowRight className="w-4 h-4 rtl:rotate-180" />
        </button>

        {/* أزرار التواصل السريعة */}
        {(item.phone || item.whatsapp) && (
          <div className="flex items-center gap-2 pt-1">
            {item.phone && (
              <a
                href={\`tel:\${item.phone}\`}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition border border-zinc-700"
              >
                <Phone className="w-3 h-3 text-blue-400" />
                <span>اتصال</span>
              </a>
            )}
            {(item.whatsapp || item.phone) && (
              <a
                href={\`https://wa.me/\${(item.whatsapp || item.phone).replace(/[^0-9]/g, '')}\`}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition"
              >
                <MessageCircle className="w-3 h-3" />
                <span>واتساب</span>
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
`;

fs.writeFileSync('src/pages/public/businesses/BusinessesPage.tsx', businessesPageCode, 'utf8');

// 3. تحديث صفحة تفاصيل المنشأة BusinessProfilePage.tsx بنفس الهوية والشارات
const businessProfilePageCode = `import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star, MapPin, Phone, ArrowRight, Share2, ShieldCheck,
  X, ZoomIn, Bed, Wifi, Car, Stethoscope, Users, Truck, Gem,
  Award, Loader2, Frown, Waves, MessageCircle
} from 'lucide-react';
import { AdBanner } from '../../components/common/AdBanner';
import { supabase } from '../../lib/supabase';

${badgeHelper}

export const BusinessProfilePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [business, setBusiness] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchBusiness = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

        let query = supabase.from('businesses').select('*');
        if (isUuid) {
          query = query.eq('id', slug);
        } else {
          query = query.eq('slug', slug);
        }

        let { data, error } = await query.maybeSingle();

        if (!data && !isUuid) {
          const { data: fallbackData } = await supabase.from('businesses').select('*').eq('name', decodeURIComponent(slug)).maybeSingle();
          data = fallbackData;
        }

        if (!error && data && isMounted) {
          setBusiness(data);
        } else if (isMounted) {
          setBusiness(null);
        }
      } catch (err) {
        console.error('Fetch business error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBusiness();
    return () => { isMounted = false; };
  }, [slug]);

  if (loading) {
    return (
      <div dir="rtl" className="min-h-[60vh] flex flex-col items-center justify-center font-['Cairo',sans-serif]">
        <Loader2 className="w-10 h-10 animate-spin text-[#FFC500] mb-2" />
        <p className="text-xs text-zinc-400 font-bold">جاري تحميل بيانات المنشأة...</p>
      </div>
    );
  }

  if (!business) {
    return (
      <div dir="rtl" className="max-w-4xl mx-auto px-4 py-20 text-center font-['Cairo',sans-serif]">
        <Frown className="w-16 h-16 mx-auto text-zinc-600 mb-3" />
        <h2 className="text-lg font-bold text-zinc-200 mb-2">المنشأة غير موجودة أو قيد المراجعة</h2>
        <button
          onClick={() => navigate('/businesses')}
          className="px-5 py-2 bg-[#FFC500] text-zinc-950 font-black rounded-xl text-xs mt-3"
        >
          العودة لدليل المنشآت
        </button>
      </div>
    );
  }

  const feat = business.sections_config?.features || {};
  const galleryList = Array.isArray(business.gallery_urls) ? business.gallery_urls.filter((u: any) => typeof u === 'string' && u.length > 0) : [];
  const hasRating = Number(business.rating) > 0 && Number(business.review_count) > 0;
  const isVerified = business.is_verified === true;

  return (
    <div dir="rtl" className="max-w-6xl mx-auto px-3 sm:px-6 py-4 space-y-5 font-['Cairo',sans-serif] text-zinc-100">
      <AdBanner placementId="1" className="mb-2" />

      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-bold transition border border-zinc-800 shadow-md"
        >
          <ArrowRight className="w-4 h-4" />
          <span>رجوع</span>
        </button>

        <button
          onClick={async () => {
            if (navigator.share) {
              await navigator.share({ title: business.name, url: window.location.href });
            } else {
              await navigator.clipboard.writeText(window.location.href);
              alert('تم نسخ الرابط بنجاح!');
            }
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-bold transition border border-zinc-800"
        >
          <Share2 className="w-4 h-4 text-[#FFC500]" />
          <span>مشاركة</span>
        </button>
      </div>

      {/* الهيدر المتناسق تماماً مع الهوية */}
      <div className="relative bg-[#0B0F17] rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl">
        <div className="h-56 sm:h-80 w-full bg-zinc-900 relative">
          {business.cover_url ? (
            <img src={business.cover_url} alt={business.name} className="w-full h-full object-cover opacity-85" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center text-zinc-600 text-xs">لا يوجد غلاف معتمد</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-transparent to-transparent" />
        </div>

        <div className="p-5 sm:p-7 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-5 -mt-16 sm:-mt-20 relative z-10">
          <div className="flex items-end gap-4">
            {business.logo_url && (
              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-[#0B0F17] p-1.5 shadow-2xl border-2 border-black shrink-0">
                <img src={business.logo_url} alt={business.name} className="w-full h-full object-contain rounded-xl" />
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-3xl font-black text-white">{business.name}</h1>
                {isVerified && <VerifiedRosette type={business.badge_type || 'gold'} size={22} />}
              </div>

              <div className="flex items-center gap-2 mt-1.5 text-xs text-zinc-400 flex-wrap">
                {hasRating ? (
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" /> {Number(business.rating).toFixed(1)} ({business.review_count} تقييم)
                  </span>
                ) : (
                  <span className="text-zinc-500">لا توجد تقييمات بعد</span>
                )}
                {(business.city || business.address) && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#FFC500] shrink-0" />
                      <span>{business.address || business.city}</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {!isVerified && (
            <div className="w-full sm:w-auto">
              <a
                href={\`https://wa.me/967770000000?text=\${encodeURIComponent('طلب إثبات ملكية وإدارة المنشأة: ' + business.name)}\`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-4 py-2.5 bg-[#EF4444] hover:bg-red-700 text-white rounded-full text-xs font-black flex items-center justify-center gap-1.5 shadow-lg transition active:scale-95"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>إثبات الملكية</span>
              </a>
            </div>
          )}
        </div>
      </div>

      {/* التفاصيل ومعرض الصور */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {business.description && (
            <div className="bg-[#0B0F17] p-5 rounded-2xl border border-zinc-800 shadow-md">
              <h2 className="text-sm font-black text-white mb-2 flex items-center gap-2 border-b border-zinc-800/80 pb-2">
                <Award className="w-4 h-4 text-[#FFC500]" />
                <span>عن المنشأة والخدمات</span>
              </h2>
              <p className="text-zinc-300 leading-relaxed text-xs sm:text-sm whitespace-pre-line">
                {business.description}
              </p>
            </div>
          )}

          {galleryList.length > 0 && (
            <div className="bg-[#0B0F17] p-5 rounded-2xl border border-zinc-800 shadow-md">
              <h2 className="text-sm font-black text-white mb-3 flex items-center gap-2 border-b border-zinc-800/80 pb-2">
                <ZoomIn className="w-4 h-4 text-[#FFC500]" />
                <span>معرض الصور ({galleryList.length})</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {galleryList.map((img: string, idx: number) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className="h-24 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 cursor-pointer relative group"
                  >
                    <img src={img} alt={\`صورة \${idx + 1}\`} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* معلومات التواصل والدوام */}
        <div className="space-y-4">
          <div className="bg-[#0B0F17] p-5 rounded-2xl border border-zinc-800 shadow-md space-y-3.5">
            <h3 className="font-bold text-white text-xs border-b border-zinc-800 pb-2 flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#FFC500]" />
              <span>معلومات التواصل والحجز</span>
            </h3>

            <div className="space-y-2">
              {business.phone && (
                <a href={\`tel:\${business.phone}\`} className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 text-xs transition">
                  <Phone className="w-3.5 h-3.5" />
                  <span>اتصال: {business.phone}</span>
                </a>
              )}

              {(business.whatsapp || business.phone) && (
                <a href={\`https://wa.me/\${(business.whatsapp || business.phone).replace(/[^0-9]/g, '')}\`} target="_blank" rel="noreferrer" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 text-xs transition">
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>محادثة واتساب</span>
                </a>
              )}
            </div>

            {business.sections_config?.working_hours && (
              <div className="border-t border-zinc-800 pt-3 text-xs flex items-center justify-between text-zinc-300">
                <span className="text-zinc-500">ساعات الدوام:</span>
                <span className="font-bold">{business.sections_config.working_hours}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <AdBanner placementId="3" className="mt-4" />

      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-3xl max-h-[85vh]" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedImage(null)} className="absolute -top-10 left-0 text-white p-2">
              <X className="w-6 h-6" />
            </button>
            <img src={selectedImage} alt="تكبير" className="max-w-full max-h-[80vh] rounded-2xl object-contain shadow-2xl border border-zinc-700" />
          </div>
        </div>
      )}
    </div>
  );
};
`;

fs.writeFileSync('src/pages/templates/BusinessProfilePage.tsx', businessProfilePageCode, 'utf8');

console.log('✅ تم تطبيق تصميم البنوك الاحترافي بنجاح تام على القالبين!');
