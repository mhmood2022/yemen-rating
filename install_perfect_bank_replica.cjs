const fs = require('fs');

const officialBadgeCode = `
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
`;

// 1. تحديث BusinessesPage.tsx بالبطاقات المطابقة لبطاقات البنوك (الصورة 4)
const businessesPageCode = `import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search, MapPin, ArrowRight, Star,
  Loader2, Frown, Store, ShieldCheck
} from 'lucide-react';
import { AdBanner } from '../../../components/common/AdBanner';
import { OFFICIAL_CATEGORIES } from '../../../data/categories';
import { supabase } from '../../../lib/supabase';

${officialBadgeCode}

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
  const hasRealRating = ratingValue > 0 && reviewCount > 0;

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
                href={\`https://wa.me/967770000000?text=\${encodeURIComponent('طلب إثبات ملكية المنشأة: ' + item.name)}\`}
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
`;

fs.writeFileSync('src/pages/public/businesses/BusinessesPage.tsx', businessesPageCode, 'utf8');

// 2. تحديث BusinessProfilePage.tsx ليطابق صفحة بنك الكريمي (الصورة 2) بالملي
const businessProfilePageCode = `import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star, MapPin, Phone, ArrowRight, ShieldCheck,
  X, ZoomIn, Bed, Wifi, Car, Stethoscope, Users, Truck, Gem,
  Loader2, Frown, Waves, MessageCircle, Globe, Mail, Clock, CheckCircle2, AlertCircle
} from 'lucide-react';
import { AdBanner } from '../../components/common/AdBanner';
import { supabase } from '../../lib/supabase';

${officialBadgeCode}

export const BusinessProfilePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [business, setBusiness] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'photos' | 'services' | 'reviews'>('photos');

  // نظام التقييم الحقيقي مع الإحصائيات الدقيقة
  const [reviews, setReviews] = useState<any[]>([]);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [userStars, setUserStars] = useState<number>(5);
  const [userName, setUserName] = useState<string>('');
  const [userComment, setUserComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);
  const [reviewStatus, setReviewStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchBusinessData = async () => {
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

        let { data: bData, error } = await query.maybeSingle();

        if (!bData && !isUuid) {
          const { data: fallback } = await supabase.from('businesses').select('*').eq('name', decodeURIComponent(slug)).maybeSingle();
          bData = fallback;
        }

        if (bData && isMounted) {
          setBusiness(bData);

          // جلب التقييمات الحقيقية حصراً من جدول reviews
          const { data: revData } = await supabase
            .from('reviews')
            .select('*')
            .eq('entity_id', bData.id)
            .order('created_at', { ascending: false });

          setReviews(revData || []);
        } else if (isMounted) {
          setBusiness(null);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBusinessData();
    return () => { isMounted = false; };
  }, [slug]);

  // إحصائيات النجوم الحقيقية (مطابقة لأشرطة بنك الكريمي بالملي)
  const ratingStats = useMemo(() => {
    const total = reviews.length;
    if (total === 0) {
      return { avg: null, total: 0, dist: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
    }

    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;

    reviews.forEach(r => {
      const s = Math.min(5, Math.max(1, Math.round(Number(r.rating || r.stars) || 5)));
      counts[s] = (counts[s] || 0) + 1;
      sum += s;
    });

    const avg = (sum / total).toFixed(1);
    const dist = {
      5: Math.round((counts[5] / total) * 100),
      4: Math.round((counts[4] / total) * 100),
      3: Math.round((counts[3] / total) * 100),
      2: Math.round((counts[2] / total) * 100),
      1: Math.round((counts[1] / total) * 100),
    };

    return { avg, total, dist };
  }, [reviews]);

  // إرسال تقييم حقيقي لقاعدة البيانات مع رسائل واضحة
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !business) return;
    setSubmittingReview(true);
    setReviewStatus(null);

    try {
      const newRev = {
        entity_id: business.id,
        entity_type: 'business',
        user_name: userName.trim(),
        rating: userStars,
        comment: userComment.trim() || null,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase.from('reviews').insert([newRev]);

      if (error) {
        throw error;
      }

      setReviews(prev => [newRev, ...prev]);
      setReviewStatus({ type: 'success', message: 'تم تسجيل ونشر تقييمك بنجاح!' });
      setUserName('');
      setUserComment('');
      setTimeout(() => {
        setShowReviewModal(false);
        setReviewStatus(null);
      }, 2500);
    } catch (err: any) {
      console.error('Review submit failed:', err);
      setReviewStatus({ type: 'error', message: 'حدث خطأ أثناء حفظ التقييم، يرجى المحاولة لاحقاً.' });
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div dir="rtl" className="min-h-[60vh] flex flex-col items-center justify-center font-['Cairo',sans-serif] bg-black">
        <Loader2 className="w-10 h-10 animate-spin text-[#FFC500] mb-2" />
        <p className="text-xs text-zinc-400 font-bold">جاري التحميل...</p>
      </div>
    );
  }

  if (!business) {
    return (
      <div dir="rtl" className="max-w-4xl mx-auto px-4 py-20 text-center font-['Cairo',sans-serif] bg-black">
        <Frown className="w-16 h-16 mx-auto text-zinc-600 mb-3" />
        <h2 className="text-lg font-bold text-zinc-200 mb-2">المنشأة غير موجودة</h2>
        <button
          onClick={() => navigate('/businesses')}
          className="px-5 py-2 bg-[#FFC500] text-zinc-950 font-black rounded-xl text-xs mt-3"
        >
          العودة لدليل المنشآت
        </button>
      </div>
    );
  }

  const isVerified = business.is_verified === true;
  const feat = business.sections_config?.features || {};
  const galleryList = Array.isArray(business.gallery_urls) ? business.gallery_urls.filter((u: any) => typeof u === 'string' && u.length > 0) : [];
  const servicesList = Array.isArray(business.services) ? business.services : (Array.isArray(business.sections_config?.services) ? business.sections_config.services : []);

  return (
    <main dir="rtl" className="w-full max-w-md md:max-w-3xl lg:max-w-4xl min-h-screen bg-black flex flex-col pb-12 select-none relative mx-auto md:px-4 font-['Cairo',sans-serif] text-zinc-100">
      {/* 🌟 1. إعلان البنر العلوي (YR Ads Top Unit) */}
      <AdBanner placementId="1" className="mb-2 mt-1" />

      {/* 1. غلاف المنشأة الانسيابي المتصل مع زر الرجوع الأيقوني */}
      <div className="relative w-full h-44 sm:h-52 md:h-60 rounded-none md:rounded-2xl bg-gradient-to-r from-[#002244] via-[#003B73] to-[#0A4D80] flex items-center justify-center overflow-hidden mt-0 md:mt-1 shadow-lg">
        {business.cover_url ? (
          <img src={business.cover_url} alt={business.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">لا يوجد غلاف معتمد</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30" />

        <button
          type="button"
          onClick={() => window.history.length > 1 ? window.history.back() : navigate('/businesses')}
          className="absolute top-3.5 right-3.5 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/15 text-zinc-300 hover:text-[#FFC500] flex items-center justify-center transition active:scale-90 shadow-md cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 2. الشعار متداخل في اليمين (-mt-10) + زر إثبات الملكية في اليسار */}
      <div className="px-4 relative flex items-end justify-between -mt-10 mb-2">
        <div className="relative order-1">
          <div className="w-20 h-20 rounded-2xl shadow-2xl border-2 border-black flex items-center justify-center overflow-hidden bg-[#0B0F17]">
            {business.logo_url ? (
              <img src={business.logo_url} alt={business.name} className="w-full h-full object-contain p-1" />
            ) : (
              <Store className="w-8 h-8 text-zinc-600" />
            )}
          </div>
        </div>

        <div className="order-2 mb-1">
          {!isVerified && (
            <a
              href={\`https://wa.me/967770000000?text=\${encodeURIComponent('طلب إثبات ملكية المنشأة: ' + business.name)}\`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#EF4444] hover:bg-red-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-lg transition active:scale-95 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>إثبات الملكية</span>
            </a>
          )}
        </div>
      </div>

      {/* 3. بيانات المنشأة الأساسية بانسيابية تامة وبدون مربعات معزولة */}
      <div className="px-4 space-y-1.5 text-right">
        <div className="inline-flex items-center gap-2 flex-wrap">
          <h1 className="text-lg sm:text-xl font-black text-white leading-snug inline">
            {business.name}
          </h1>
          {isVerified && <OfficialVerifiedBadge type={business.badge_type || 'gold'} size={20} />}
        </div>

        {/* سطر التقييم الواقعي */}
        <div className="flex items-center justify-start gap-1.5 text-[#FFC500] text-xs font-bold">
          <span className="text-white font-medium text-[11px]">★التقييمات</span>
          {ratingStats.avg ? (
            <>
              <div className="flex text-[#FFC500]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={\`w-3 h-3 \${i < Math.round(Number(ratingStats.avg)) ? 'fill-[#FFC500]' : 'text-zinc-700'}\`} />
                ))}
              </div>
              <span className="text-white text-sm font-black">{ratingStats.avg}</span>
              <span className="text-zinc-400 font-normal text-[11px]">({ratingStats.total} تقييم)</span>
            </>
          ) : (
            <span className="text-zinc-400 font-normal text-[11px]">لا توجد تقييمات بعد</span>
          )}
        </div>

        {/* النبذة الطبيعية */}
        {business.description && (
          <p className="text-zinc-300 text-xs leading-relaxed font-medium pt-1">
            {business.description}
          </p>
        )}

        {/* العنوان والمدينة */}
        <div className="flex items-center justify-start gap-3 text-xs font-semibold text-zinc-400 pt-1 pb-2 flex-wrap">
          {(business.city || business.address) && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#FFC500]" />
              <span>{business.address || business.city}</span>
            </span>
          )}
        </div>
      </div>

      {/* 4. شريط التبويبات الفاخر المطابق لصفحة البنك (الصورة 2) */}
      <div className="px-4 border-b border-zinc-900 mt-2">
        <div className="flex items-center gap-6 text-xs font-black">
          <button
            onClick={() => setActiveTab('photos')}
            className={\`pb-2.5 transition relative \${
              activeTab === 'photos' ? 'text-[#FFC500]' : 'text-zinc-400 hover:text-zinc-200'
            }\`}
          >
            معرض الصور
            {activeTab === 'photos' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FFC500] rounded-full" />}
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={\`pb-2.5 transition relative \${
              activeTab === 'services' ? 'text-[#FFC500]' : 'text-zinc-400 hover:text-zinc-200'
            }\`}
          >
            الخدمات والمرافق
            {activeTab === 'services' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FFC500] rounded-full" />}
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={\`pb-2.5 transition relative \${
              activeTab === 'reviews' ? 'text-[#FFC500]' : 'text-zinc-400 hover:text-zinc-200'
            }\`}
          >
            التقييمات ({ratingStats.total})
            {activeTab === 'reviews' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FFC500] rounded-full" />}
          </button>
        </div>
      </div>

      {/* 5. محتوى التبويبات */}
      <div className="px-4 pt-4">
        {/* أ) تبويب الصور: شبكة بوسترات مثل بنك الكريمي */}
        {activeTab === 'photos' && (
          <div>
            {galleryList.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {galleryList.map((img: string, idx: number) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 cursor-pointer group"
                  >
                    <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <ZoomIn className="w-6 h-6 text-[#FFC500]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-xs text-zinc-500 py-10">لا توجد صور إضافية مرفوعة</p>
            )}
          </div>
        )}

        {/* ب) تبويب الخدمات كما وضعتها الإدارة */}
        {activeTab === 'services' && (
          <div className="space-y-3">
            {servicesList.length > 0 ? (
              <div className="space-y-2">
                {servicesList.map((srv: any, idx: number) => (
                  <div key={idx} className="p-3 bg-[#0B0F17] border border-zinc-800 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">{srv.name || srv.title}</h4>
                      {srv.description && <p className="text-[11px] text-zinc-400 mt-0.5">{srv.description}</p>}
                    </div>
                    {srv.price && (
                      <span className="text-xs font-black text-[#FFC500]">
                        {srv.price} {srv.currency || 'ريال'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              /* إذا لم تكن هناك خدمات بقوائم مسجلة، تظهر المرافق المعتمدة */
              <div className="grid grid-cols-2 gap-2">
                {feat.rooms_count > 0 && (
                  <div className="p-3 bg-[#0B0F17] border border-zinc-800 rounded-xl text-xs flex items-center gap-2 text-zinc-300">
                    <Bed className="w-4 h-4 text-amber-400" /> <span>{feat.rooms_count} غرفة</span>
                  </div>
                )}
                {feat.has_pool && (
                  <div className="p-3 bg-[#0B0F17] border border-zinc-800 rounded-xl text-xs flex items-center gap-2 text-zinc-300">
                    <Waves className="w-4 h-4 text-blue-400" /> <span>مسبح</span>
                  </div>
                )}
                {feat.has_wifi && (
                  <div className="p-3 bg-[#0B0F17] border border-zinc-800 rounded-xl text-xs flex items-center gap-2 text-zinc-300">
                    <Wifi className="w-4 h-4 text-indigo-400" /> <span>واي فاي</span>
                  </div>
                )}
                {feat.has_parking && (
                  <div className="p-3 bg-[#0B0F17] border border-zinc-800 rounded-xl text-xs flex items-center gap-2 text-zinc-300">
                    <Car className="w-4 h-4 text-emerald-400" /> <span>مواقف سيارات</span>
                  </div>
                )}
                {feat.has_emergency && (
                  <div className="p-3 bg-[#0B0F17] border border-zinc-800 rounded-xl text-xs flex items-center gap-2 text-zinc-300">
                    <Stethoscope className="w-4 h-4 text-red-400" /> <span>طوارئ 24 ساعة</span>
                  </div>
                )}
                {feat.has_delivery && (
                  <div className="p-3 bg-[#0B0F17] border border-zinc-800 rounded-xl text-xs flex items-center gap-2 text-zinc-300">
                    <Truck className="w-4 h-4 text-emerald-400" /> <span>خدمة توصيل</span>
                  </div>
                )}
                {feat.has_family_sections && (
                  <div className="p-3 bg-[#0B0F17] border border-zinc-800 rounded-xl text-xs flex items-center gap-2 text-zinc-300">
                    <Users className="w-4 h-4 text-amber-400" /> <span>أقسام عوائل</span>
                  </div>
                )}
                {feat.gold_carat && (
                  <div className="p-3 bg-[#0B0F17] border border-zinc-800 rounded-xl text-xs flex items-center gap-2 text-zinc-300">
                    <Gem className="w-4 h-4 text-yellow-400" /> <span>ذهب عيار {feat.gold_carat}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 🌟 2. إعلان منتصف الصفحة (YR Ads In-Feed Unit) */}
        <AdBanner placementId="2" className="my-4" />

        {/* جـ) تبويب التقييمات: نظام أشرطة التوزيع المطابق تماماً لصورة بنك الكريمي (الصورة 2) */}
        {activeTab === 'reviews' && (
          <div className="space-y-5">
            <div className="bg-[#0B0F17] p-5 rounded-2xl border border-zinc-800 space-y-4">
              <h3 className="text-sm font-black text-white">التقييمات</h3>

              {ratingStats.total > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center border-b border-zinc-800/80 pb-4">
                  {/* النتيجة الكبيرة */}
                  <div className="text-right">
                    <span className="text-zinc-400 text-xs block mb-1">تقييم الزوار</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-black text-white">{ratingStats.avg}</span>
                      <span className="text-zinc-500 text-sm font-bold">/ 5</span>
                    </div>
                    <div className="flex text-[#FFC500] my-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={\`w-3.5 h-3.5 \${i < Math.round(Number(ratingStats.avg)) ? 'fill-[#FFC500]' : 'text-zinc-700'}\`} />
                      ))}
                    </div>
                    <span className="text-xs text-zinc-400">{ratingStats.total} تقييم</span>
                  </div>

                  {/* أشرطة التوزيع 5 نجوم إلى 1 نجمة (مثل صورة الكريمي) */}
                  <div className="space-y-1.5 text-xs text-zinc-400">
                    {[5, 4, 3, 2, 1].map((s) => (
                      <div key={s} className="flex items-center gap-2">
                        <span className="w-4 text-left font-bold">{s}★</span>
                        <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#FFC500] rounded-full"
                            style={{ width: \`\${(ratingStats.dist as any)[s]}%\` }}
                          />
                        </div>
                        <span className="w-8 text-right font-medium text-[11px]">{(ratingStats.dist as any)[s]}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 border-b border-zinc-800/80">
                  <p className="text-zinc-500 text-xs">لا توجد تقييمات بعد لهذه المنشأة.</p>
                </div>
              )}

              {/* دعوة التقييم والزر الذهبي */}
              <div className="text-center space-y-2 pt-1">
                <p className="text-xs font-bold text-zinc-300">هل تعاملت مع هذه المنشأة؟</p>
                <p className="text-[11px] text-zinc-500">شارك تجربتك وساعد الآخرين في اتخاذ القرار</p>

                <button
                  type="button"
                  onClick={() => setShowReviewModal(!showReviewModal)}
                  className="w-full py-2.5 rounded-xl bg-[#FFC500] hover:bg-amber-400 text-black font-black text-xs flex items-center justify-center gap-1.5 shadow transition active:scale-98"
                >
                  <Star className="w-3.5 h-3.5 fill-black" />
                  <span>قيّم هذه المنشأة</span>
                </button>
              </div>

              {/* نافذة / نموذج إدخال التقييم الحقيقي مع رسائل الخطأ والنجاح الصريحة */}
              {showReviewModal && (
                <form onSubmit={handleSubmitReview} className="bg-black p-4 rounded-xl border border-zinc-800 space-y-3 pt-3">
                  <div className="flex items-center justify-center gap-2 pt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        onClick={() => setUserStars(s)}
                        className={\`w-7 h-7 cursor-pointer transition \${
                          s <= userStars ? 'text-[#FFC500] fill-[#FFC500]' : 'text-zinc-700 hover:text-zinc-500'
                        }\`}
                      />
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="اسمك الكريم"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                    className="w-full bg-[#0E1422] border border-zinc-800 focus:border-[#FFC500] text-zinc-100 placeholder-zinc-500 px-3 py-2 rounded-lg text-xs outline-none transition"
                  />

                  <textarea
                    placeholder="اكتب تفاصيل تجربتك بأمانة..."
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    rows={2}
                    className="w-full bg-[#0E1422] border border-zinc-800 focus:border-[#FFC500] text-zinc-100 placeholder-zinc-500 p-3 rounded-lg text-xs outline-none transition"
                  />

                  {/* رسائل التنبيه الواضحة */}
                  {reviewStatus && (
                    <div className={\`p-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 \${
                      reviewStatus.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }\`}>
                      {reviewStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      <span>{reviewStatus.message}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="w-full py-2 bg-[#FFC500] text-black font-bold rounded-lg text-xs flex items-center justify-center gap-1"
                  >
                    <span>{submittingReview ? 'جاري الإرسال...' : 'نشر التقييم'}</span>
                  </button>
                </form>
              )}
            </div>

            {/* قائمة المراجعات الحقيقية المسجلة */}
            {reviews.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-zinc-400">آخر التقييمات:</h4>
                {reviews.map((r, i) => (
                  <div key={i} className="p-3 bg-[#0B0F17] rounded-xl border border-zinc-800 text-right space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 text-xs">
                          {r.user_name?.charAt(0) || 'ز'}
                        </div>
                        <span className="text-xs font-bold text-white">{r.user_name}</span>
                      </div>
                      <div className="flex text-[#FFC500]">
                        {Array.from({ length: Number(r.rating || r.stars) || 5 }).map((_, si) => (
                          <Star key={si} className="w-2.5 h-2.5 fill-[#FFC500]" />
                        ))}
                      </div>
                    </div>
                    {r.comment && <p className="text-xs text-zinc-300 pt-0.5 leading-relaxed">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 6. قسم "تواصل معنا" الأيقوني الدائري الفاخر (مطابق لأسفل صفحة البنك في الصورة 2) */}
      <div className="px-4 pt-8 pb-4 text-center space-y-3 border-t border-zinc-900 mt-6">
        <h3 className="text-xs font-bold text-zinc-400">تواصل معنا</h3>

        <div className="flex items-center justify-center gap-3.5 flex-wrap">
          {business.phone && (
            <a
              href={\`tel:\${business.phone}\`}
              className="w-10 h-10 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-[#FFC500] transition shadow-md"
              title="اتصال هاتفي"
            >
              <Phone className="w-4 h-4" />
            </a>
          )}

          {(business.whatsapp || business.phone) && (
            <a
              href={\`https://wa.me/\${(business.whatsapp || business.phone).replace(/[^0-9]/g, '')}\`}
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-emerald-400 transition shadow-md"
              title="محادثة واتساب"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
          )}

          {business.website_url && (
            <a
              href={business.website_url}
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-blue-400 transition shadow-md"
              title="الموقع الإلكتروني"
            >
              <Globe className="w-4 h-4" />
            </a>
          )}

          {business.email && (
            <a
              href={\`mailto:\${business.email}\`}
              className="w-10 h-10 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-amber-400 transition shadow-md"
              title="البريد الإلكتروني"
            >
              <Mail className="w-4 h-4" />
            </a>
          )}

          {(business.address || business.city) && (
            <a
              href={\`https://www.google.com/maps/search/?api=1&query=\${encodeURIComponent((business.name || '') + ' ' + (business.address || business.city || ''))}\`}
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-rose-400 transition shadow-md"
              title="الموقع الجغرافي"
            >
              <MapPin className="w-4 h-4" />
            </a>
          )}

          {business.sections_config?.working_hours && (
            <div
              className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 shadow-md cursor-default"
              title={\`ساعات العمل: \${business.sections_config.working_hours}\`}
            >
              <Clock className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>

      {/* 🌟 3. إعلان البنر السفلي (YR Ads Bottom Unit) */}
      <AdBanner placementId="3" className="mt-4 px-4" />

      {/* نافذة تكبير الصورة (Lightbox) */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-2xl max-h-[85vh]" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedImage(null)} className="absolute -top-10 left-0 text-white p-2">
              <X className="w-6 h-6" />
            </button>
            <img src={selectedImage} alt="" className="max-w-full max-h-[80vh] rounded-2xl object-contain shadow-2xl border border-zinc-800" />
          </div>
        </div>
      )}
    </main>
  );
};
`;

fs.writeFileSync('src/pages/templates/BusinessProfilePage.tsx', businessProfilePageCode, 'utf8');

console.log('✅ تم تركيب التطابق التام مع صفحة البنك والإعلانات ونظام التقييم بنجاح!');
