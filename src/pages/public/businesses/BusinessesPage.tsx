import React, { useState, useEffect, useMemo } from 'react';
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
            query = query.or(`category_id.eq.${catRow.id},category_id.eq.${categoryParam}`);
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
              {currentCategory ? `المنشآت المعتمدة المسجلة في قسم ${currentCategory.name}` : 'كافة المنشآت والخدمات المعتمدة'}
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
          <a href={`tel:${item.phone}`} className="flex-1 text-center py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition">
            <Phone className="w-3.5 h-3.5 text-blue-400" /> اتصال
          </a>
        )}
        {(item.whatsapp || item.phone) && (
          <a href={`https://wa.me/${(item.whatsapp || item.phone).replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="flex-1 text-center py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition">
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
