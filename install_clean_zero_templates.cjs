const fs = require('fs');
const { execSync } = require('child_process');

console.log('🧹 1. بناء قالب العرض الجماعي المصفّر الخالي من أي بيانات وهمية (BusinessesPage.tsx)...');

const businessesPageClean = `import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search, MapPin, Phone, ArrowRight, Star,
  Clock, CheckCircle2, Bed, Wifi, Car, Truck, Users, Gem,
  Waves, Loader2, Frown, ShieldCheck, Stethoscope, Store
} from 'lucide-react';
import { AdBanner } from '../../../components/common/AdBanner';
import { OFFICIAL_CATEGORIES } from '../../../data/categories';
import { supabase } from '../../../lib/supabase';

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

  // جلب منشآت هذا التصنيف فقط وحصراً من Supabase
  useEffect(() => {
    let isMounted = true;
    const fetchCategoryBusinesses = async () => {
      setLoading(true);
      try {
        let query = supabase.from('businesses').select('*');

        if (categoryParam !== 'all') {
          // جلب معرف التصنيف من جدول categories إن وجد
          const { data: catRow } = await supabase
            .from('categories')
            .select('id, slug')
            .eq('slug', categoryParam)
            .maybeSingle();

          if (catRow && catRow.id) {
            query = query.or(\`category_id.eq.\${catRow.id},category_id.eq.\${categoryParam}\`);
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

  // التصفية بالمدينة والبحث النصي
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
    <div dir="rtl" className="max-w-7xl mx-auto px-3 sm:px-6 py-4 space-y-5 font-['Cairo',sans-serif] text-zinc-100">
      {/* 1. إعلان البنر العلوي */}
      <div className="w-full">
        <AdBanner placementId="1" className="rounded-2xl overflow-hidden shadow-lg border border-zinc-800/80" />
      </div>

      {/* ترويسة التصنيف الرسمية المحددة */}
      <div className="bg-gradient-to-r from-zinc-900 via-[#0D121F] to-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xl flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FFC500] to-amber-500 text-zinc-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20 shrink-0">
            <CategoryIcon className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              {currentCategory ? currentCategory.name : 'دليل المنشآت'}
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              {currentCategory ? \`المنشآت المعتمدة المسجلة في قسم \${currentCategory.name}\` : 'كافة المنشآت والخدمات المعتمدة'}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition border border-zinc-700"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة للرئيسية</span>
        </button>
      </div>

      {/* شريط البحث والمدينة */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-zinc-400 absolute right-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ابحث عن منشأة في هذا القسم..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0E1422] border border-zinc-800 focus:border-[#FFC500] text-zinc-100 placeholder-zinc-500 pr-11 pl-4 py-2.5 rounded-xl text-xs outline-none transition"
          />
        </div>

        <div>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full bg-[#0E1422] border border-zinc-800 focus:border-[#FFC500] text-zinc-200 px-3 py-2.5 rounded-xl text-xs outline-none transition"
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

      {/* شبكة الكروت */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center bg-[#0B0F19] rounded-2xl border border-zinc-800/80">
          <Loader2 className="w-8 h-8 animate-spin text-[#FFC500] mb-2" />
          <p className="text-xs text-zinc-400">جاري تحميل المنشآت المعتمدة...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-[#0B0F19] rounded-2xl border border-zinc-800/80 p-6">
          <Frown className="w-12 h-12 mx-auto text-zinc-600 mb-2" />
          <h3 className="text-sm font-bold text-zinc-300 mb-1">
            لا توجد منشآت مضافة في قسم ({currentCategory ? currentCategory.name : 'هذا القسم'}) حالياً
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            ستظهر المنشآت هنا فور إضافتها واعتمادها من قبل إدارة الموقع.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.slice(0, 3).map((item) => (
              <PureBusinessCard key={item.id} item={item} onSelect={() => navigate('/businesses/' + (item.slug || item.id))} />
            ))}
          </div>

          {/* 2. إعلان وسط القائمة */}
          <div className="w-full my-4">
            <AdBanner placementId="2" className="rounded-2xl overflow-hidden shadow-lg border border-zinc-800/80" />
          </div>

          {filtered.length > 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.slice(3).map((item) => (
                <PureBusinessCard key={item.id} item={item} onSelect={() => navigate('/businesses/' + (item.slug || item.id))} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. إعلان البنر السفلي */}
      <div className="w-full pt-2">
        <AdBanner placementId="3" className="rounded-2xl overflow-hidden shadow-lg border border-zinc-800/80" />
      </div>
    </div>
  );
};

// بطاقة المنشأة الصافية - تعرض فقط ما تم إدخاله من الإدارة
function PureBusinessCard({ item, onSelect }: { item: any; onSelect: () => void }) {
  const feat = item.sections_config?.features || {};
  const hasRating = Number(item.rating) > 0;

  return (
    <div className="bg-[#0B0F19] rounded-2xl border border-zinc-800/90 overflow-hidden hover:border-[#FFC500]/60 transition-all duration-300 flex flex-col justify-between group shadow-xl">
      <div>
        {/* الغلاف */}
        <div className="relative h-44 bg-zinc-900 overflow-hidden cursor-pointer" onClick={onSelect}>
          {item.cover_url ? (
            <img src={item.cover_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center text-zinc-600 text-xs">لا توجد صورة غلاف</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-black/30" />

          {/* الشعار */}
          {item.logo_url && (
            <div className="absolute bottom-3 right-3 w-13 h-13 rounded-xl bg-zinc-900/95 p-1 shadow-xl border border-zinc-700">
              <img src={item.logo_url} alt={item.name} className="w-full h-full object-contain rounded-lg" />
            </div>
          )}

          {/* شارة التوثيق الحقيقية فقط والتقييم إن وجد */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            {item.is_verified === true && (
              <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                <CheckCircle2 className="w-3 h-3" /> موثّق
              </span>
            )}
            {hasRating && (
              <span className="bg-black/60 backdrop-blur-md text-amber-400 text-[11px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border border-amber-500/20">
                <Star className="w-3 h-3 fill-amber-400" /> {Number(item.rating).toFixed(1)}
              </span>
            )}
          </div>
        </div>

        <div className="p-4">
          <h3 onClick={onSelect} className="font-black text-base text-white group-hover:text-[#FFC500] transition truncate cursor-pointer">
            {item.name}
          </h3>

          {(item.city || item.address) && (
            <p className="text-xs text-zinc-400 flex items-center gap-1 mt-1 mb-2">
              <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
              <span className="truncate">{item.address || item.city}</span>
            </p>
          )}

          {item.description && (
            <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed mb-3">
              {item.description}
            </p>
          )}

          {/* ميزات النشاط المدخلة من الإدارة فقط */}
          <div className="flex flex-wrap gap-1.5">
            {feat.rooms_count > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-amber-300 flex items-center gap-1">
                <Bed className="w-3 h-3" /> {feat.rooms_count} غرفة
              </span>
            )}
            {feat.has_pool && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                <Waves className="w-3 h-3" /> مسبح
              </span>
            )}
            {feat.has_wifi && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                <Wifi className="w-3 h-3" /> واي فاي
              </span>
            )}
            {feat.has_emergency && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1">
                <Stethoscope className="w-3 h-3" /> طوارئ 24 س
              </span>
            )}
            {feat.has_delivery && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <Truck className="w-3 h-3" /> توصيل
              </span>
            )}
            {feat.has_family_sections && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                <Users className="w-3 h-3" /> عوائل
              </span>
            )}
            {feat.gold_carat && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 flex items-center gap-1">
                <Gem className="w-3 h-3" /> عيار {feat.gold_carat}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-3 bg-zinc-900/80 border-t border-zinc-800/80 flex items-center gap-2">
        {item.phone && (
          <a href={\`tel:\${item.phone}\`} className="flex-1 text-center py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition">
            <Phone className="w-3.5 h-3.5 text-blue-400" /> اتصال
          </a>
        )}
        {(item.whatsapp || item.phone) && (
          <a href={\`https://wa.me/\${(item.whatsapp || item.phone).replace(/[^0-9]/g, '')}\`} target="_blank" rel="noreferrer" className="flex-1 text-center py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition">
            واتساب
          </a>
        )}
        <button onClick={onSelect} className="px-4 py-2 bg-[#FFC500] hover:bg-amber-400 text-zinc-950 font-black rounded-xl text-xs transition shrink-0">
          التفاصيل
        </button>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/pages/public/businesses/BusinessesPage.tsx', businessesPageClean, 'utf8');

console.log('🧹 2. بناء قالب العرض الفردي المصفّر وحل مشكلة جلب المعرّف (BusinessProfilePage.tsx)...');

const businessProfilePageClean = `import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star, MapPin, Phone, ArrowRight, Share2, CheckCircle2,
  X, ZoomIn, Bed, Wifi, Car, Stethoscope, Users, Truck, Gem,
  Award, Send, Loader2, Frown, Waves, Clock
} from 'lucide-react';
import { AdBanner } from '../../components/common/AdBanner';
import { supabase } from '../../lib/supabase';

export const BusinessProfilePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [business, setBusiness] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // جلب المنشأة الآمن من Supabase بدون أخطاء الـ UUID
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

        // محاولة بديلة إذا كان الـ slug مسجلاً كـ id
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
  const hasRating = Number(business.rating) > 0;

  return (
    <div dir="rtl" className="max-w-6xl mx-auto px-3 sm:px-6 py-5 space-y-6 font-['Cairo',sans-serif] text-zinc-100">
      {/* إعلان البنر العلوي */}
      <div className="w-full">
        <AdBanner placementId="1" className="rounded-2xl overflow-hidden shadow-lg border border-zinc-800/80" />
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-bold transition border border-zinc-800 shadow-md"
        >
          <ArrowRight className="w-4 h-4" />
          <span>رجوع</span>
        </button>
      </div>

      {/* الهيدر والغلاف */}
      <div className="relative bg-[#0B0F19] rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl">
        <div className="h-56 sm:h-80 w-full bg-zinc-900 relative">
          {business.cover_url ? (
            <img src={business.cover_url} alt={business.name} className="w-full h-full object-cover opacity-85" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center text-zinc-600 text-xs">لا يوجد غلاف معتمد</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent" />
        </div>

        <div className="p-5 sm:p-7 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-5 -mt-16 sm:-mt-20 relative z-10">
          <div className="flex items-end gap-4">
            {business.logo_url && (
              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-[#0B0F19] p-1.5 shadow-2xl border border-zinc-700 shrink-0">
                <img src={business.logo_url} alt={business.name} className="w-full h-full object-contain rounded-xl" />
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-3xl font-black text-white">{business.name}</h1>
                {business.is_verified === true && (
                  <span className="bg-emerald-500 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> معتمد موثق
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mt-1.5 text-xs text-zinc-400 flex-wrap">
                {hasRating && (
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" /> {Number(business.rating).toFixed(1)}
                  </span>
                )}
                {(business.city || business.address) && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{business.address || business.city}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* تفاصيل المنشأة الصافية */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {business.description && (
            <div className="bg-[#0B0F19] p-5 rounded-2xl border border-zinc-800 shadow-md">
              <h2 className="text-sm font-black text-white mb-2 flex items-center gap-2 border-b border-zinc-800/80 pb-2">
                <Award className="w-4 h-4 text-[#FFC500]" />
                <span>عن المنشأة والخدمات</span>
              </h2>
              <p className="text-zinc-300 leading-relaxed text-xs sm:text-sm whitespace-pre-line">
                {business.description}
              </p>
            </div>
          )}

          {/* ميزات النشاط المدخلة فقط */}
          {Object.values(feat).some(val => !!val) && (
            <div className="bg-[#0B0F19] p-5 rounded-2xl border border-zinc-800 shadow-md">
              <h2 className="text-sm font-black text-white mb-3 flex items-center gap-2 border-b border-zinc-800/80 pb-2">
                <span>المرافق والخدمات المسجلة</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {feat.has_wifi && (
                  <div className="p-2.5 bg-zinc-900/90 rounded-xl border border-zinc-800 flex items-center gap-2 text-xs text-zinc-200">
                    <Wifi className="w-4 h-4 text-indigo-400" />
                    <span>واي فاي مجاني</span>
                  </div>
                )}
                {feat.has_pool && (
                  <div className="p-2.5 bg-zinc-900/90 rounded-xl border border-zinc-800 flex items-center gap-2 text-xs text-zinc-200">
                    <Waves className="w-4 h-4 text-blue-400" />
                    <span>مسبح</span>
                  </div>
                )}
                {feat.has_parking && (
                  <div className="p-2.5 bg-zinc-900/90 rounded-xl border border-zinc-800 flex items-center gap-2 text-xs text-zinc-200">
                    <Car className="w-4 h-4 text-emerald-400" />
                    <span>مواقف سيارات</span>
                  </div>
                )}
                {feat.has_emergency && (
                  <div className="p-2.5 bg-zinc-900/90 rounded-xl border border-zinc-800 flex items-center gap-2 text-xs text-zinc-200">
                    <Stethoscope className="w-4 h-4 text-red-400" />
                    <span>طوارئ 24 ساعة</span>
                  </div>
                )}
                {feat.has_delivery && (
                  <div className="p-2.5 bg-zinc-900/90 rounded-xl border border-zinc-800 flex items-center gap-2 text-xs text-zinc-200">
                    <Truck className="w-4 h-4 text-emerald-400" />
                    <span>خدمة توصيل</span>
                  </div>
                )}
                {feat.has_family_sections && (
                  <div className="p-2.5 bg-zinc-900/90 rounded-xl border border-zinc-800 flex items-center gap-2 text-xs text-zinc-200">
                    <Users className="w-4 h-4 text-amber-400" />
                    <span>قسم عوائل</span>
                  </div>
                )}
                {feat.rooms_count > 0 && (
                  <div className="p-2.5 bg-zinc-900/90 rounded-xl border border-zinc-800 flex items-center gap-2 text-xs text-zinc-200">
                    <Bed className="w-4 h-4 text-amber-400" />
                    <span>{feat.rooms_count} غرفة</span>
                  </div>
                )}
                {feat.gold_carat && (
                  <div className="p-2.5 bg-zinc-900/90 rounded-xl border border-zinc-800 flex items-center gap-2 text-xs text-zinc-200">
                    <Gem className="w-4 h-4 text-yellow-400" />
                    <span>ذهب عيار {feat.gold_carat}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ألبوم الصور */}
          {galleryList.length > 0 && (
            <div className="bg-[#0B0F19] p-5 rounded-2xl border border-zinc-800 shadow-md">
              <h2 className="text-sm font-black text-white mb-3 flex items-center gap-2 border-b border-zinc-800/80 pb-2">
                <ZoomIn className="w-4 h-4 text-blue-400" />
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

        {/* العمود الأيسر: أزرار التواصل وأوقات الدوام المعتمدة */}
        <div className="space-y-5">
          <div className="bg-[#0B0F19] p-5 rounded-2xl border border-zinc-800 shadow-md space-y-4">
            <h3 className="font-bold text-white text-xs border-b border-zinc-800 pb-2 flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>معلومات التواصل</span>
            </h3>

            <div className="space-y-2.5">
              {business.phone && (
                <a href={\`tel:\${business.phone}\`} className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 text-xs transition">
                  <Phone className="w-3.5 h-3.5" />
                  <span>اتصال: {business.phone}</span>
                </a>
              )}

              {(business.whatsapp || business.phone) && (
                <a href={\`https://wa.me/\${(business.whatsapp || business.phone).replace(/[^0-9]/g, '')}\`} target="_blank" rel="noreferrer" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 text-xs transition">
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

      {/* 3. إعلان البنر السفلي */}
      <div className="w-full pt-2">
        <AdBanner placementId="3" className="rounded-2xl overflow-hidden shadow-lg border border-zinc-800/80" />
      </div>

      {/* نافذة تكبير الصورة */}
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

fs.writeFileSync('src/pages/templates/BusinessProfilePage.tsx', businessProfilePageClean, 'utf8');

// 3. فحص البناء والرفع إلى GitHub
console.log('🔍 3. فحص الكود (npm run build)...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('🚀 4. الرفع إلى GitHub...');
  execSync('git add src/pages/public/businesses/BusinessesPage.tsx src/pages/templates/BusinessProfilePage.tsx');
  execSync('git commit -m "fix: install zeroed dynamic templates with strict category filtering and safe slug lookup"');
  execSync('git push origin main');
  console.log('🎉 تم بنجاح تام! تم رفع القالبين المصفّرين إلى GitHub والتحديث جارٍ على Vercel.');
} catch (e) {
  console.error('❌ خطأ في البناء:', e.message);
}
