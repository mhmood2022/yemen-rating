import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Building2, Search, MapPin, Phone, MessageCircle,
  ArrowRight, Star, ShieldCheck, ChevronLeft, Sparkles,
  Clock, Store, Utensils, Hotel, Stethoscope, Bus,
  CheckCircle2, Bed, Wifi, Car, Truck, Users, Gem,
  Waves, Loader2, Frown, Filter
} from 'lucide-react';
import { AdBanner } from '../../../components/common/AdBanner';
import { OFFICIAL_CATEGORIES, CategoryItem } from '../../../data/categories';
import { supabase } from '../../../lib/supabase';

export const BusinessesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'all';

  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [liveBusinesses, setLiveBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // تحديث التصنيف عند تغير الرابط
  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  const currentCategory = OFFICIAL_CATEGORIES.find(c => c.slug === selectedCategory);
  const Icon = currentCategory?.icon || Store;

  // جلب المنشآت الحقيقية من Supabase بناءً على التصنيف المختار
  useEffect(() => {
    let isMounted = true;
    const fetchLive = async () => {
      setLoading(true);
      try {
        let query = supabase.from('businesses').select('*');

        if (selectedCategory !== 'all') {
          const { data: catRow } = await supabase
            .from('categories')
            .select('id, slug')
            .eq('slug', selectedCategory)
            .maybeSingle();

          if (catRow && catRow.id) {
            query = query.or(`category_id.eq.${catRow.id},category_id.eq.${selectedCategory}`);
          } else {
            query = query.eq('category_id', selectedCategory);
          }
        }

        const { data, error } = await query
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (!error && data && isMounted) {
          setLiveBusinesses(data);
        } else if (isMounted) {
          // إذا لم يجد في جدول النشط، يجلب دون شرط الحالة
          const { data: allData } = await query.order('created_at', { ascending: false });
          setLiveBusinesses(allData || []);
        }
      } catch (err) {
        console.error('Error fetching businesses:', err);
        if (isMounted) setLiveBusinesses([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLive();
    return () => { isMounted = false; };
  }, [selectedCategory]);

  const filteredBusinesses = useMemo(() => {
    return liveBusinesses.filter(b => {
      const matchCity = selectedCity === 'all' || (b.city && b.city.includes(selectedCity)) || (b.address && b.address.includes(selectedCity));
      const matchQuery = !searchQuery.trim() ||
        (b.name && b.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (b.description && b.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (b.address && b.address.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCity && matchQuery;
    });
  }, [liveBusinesses, selectedCity, searchQuery]);

  return (
    <div dir="rtl" className="max-w-7xl mx-auto px-3 sm:px-6 py-4 space-y-6 font-['Cairo',sans-serif] text-zinc-100">
      {/* 🌟 1. إعلان البنر العلوي (YR Ads Top Hero Unit) */}
      <div className="w-full">
        <AdBanner placementId="1" className="rounded-2xl overflow-hidden shadow-lg border border-zinc-800/80" />
      </div>

      {/* ترويسة التصنيف الرسمية */}
      <div className="bg-gradient-to-r from-zinc-900 via-[#0D121F] to-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FFC500] to-amber-500 text-zinc-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20 shrink-0">
            <Icon className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                {currentCategory ? currentCategory.name : 'دليل المنشآت والشركات'}
              </h1>
              <span className="text-xs px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                {filteredBusinesses.length} منشأة معتمدة
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1.5">
              {currentCategory ? `تصفح وتقييم أفضل ${currentCategory.name} المعتمدة في اليمن` : 'دليل شامل وموثوق لكافة الشركات والخدمات في الجمهورية اليمنية'}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 text-xs font-extrabold transition border border-zinc-700 shadow-md self-end md:self-center"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة للرئيسية</span>
        </button>
      </div>

      {/* أشرطة الفلترة والبحث السريع */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-zinc-400 absolute right-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ابحث بالاسم، المدينة، الشارع أو الخدمة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0E1422] border border-zinc-800 focus:border-[#FFC500] text-zinc-100 placeholder-zinc-500 pr-11 pl-4 py-3 rounded-2xl text-xs sm:text-sm outline-none transition shadow-inner"
          />
        </div>

        <div>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full bg-[#0E1422] border border-zinc-800 focus:border-[#FFC500] text-zinc-200 px-4 py-3 rounded-2xl text-xs sm:text-sm outline-none transition shadow-inner"
          >
            <option value="all">كل المحافظات والمدن</option>
            <option value="صنعاء">صنعاء</option>
            <option value="عدن">عدن</option>
            <option value="تعز">تعز</option>
            <option value="الحديدة">الحديدة</option>
            <option value="حضرموت">حضرموت (المكلا / سيئون)</option>
            <option value="إب">إب</option>
            <option value="ذمار">ذمار</option>
            <option value="مأرب">مأرب</option>
          </select>
        </div>
      </div>

      {/* شريط التصنيفات السريع للتبديل بين الأقسام */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => { setSelectedCategory('all'); setSearchParams({}); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition ${
            selectedCategory === 'all'
              ? 'bg-[#FFC500] text-zinc-950 font-black shadow-md'
              : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800'
          }`}
        >
          كافة التصنيفات
        </button>
        {OFFICIAL_CATEGORIES.slice(0, 15).map(cat => (
          <button
            key={cat.slug}
            onClick={() => { setSelectedCategory(cat.slug); setSearchParams({ category: cat.slug }); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 ${
              selectedCategory === cat.slug
                ? 'bg-[#FFC500] text-zinc-950 font-black shadow-md'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800'
            }`}
          >
            <cat.icon className="w-3.5 h-3.5" />
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* شبكة الكروت للمنشآت الحقيقية */}
      {loading ? (
        <div className="py-24 text-center flex flex-col items-center justify-center bg-[#0B0F19] rounded-3xl border border-zinc-800/80">
          <Loader2 className="w-10 h-10 animate-spin text-[#FFC500] mb-3" />
          <p className="text-sm text-zinc-400 font-bold">جاري تحميل المنشآت المعتمدة من قاعدة البيانات...</p>
        </div>
      ) : filteredBusinesses.length === 0 ? (
        <div className="py-20 text-center bg-[#0B0F19] rounded-3xl border border-zinc-800/80 p-8 shadow-md">
          <Frown className="w-14 h-14 mx-auto text-zinc-600 mb-3" />
          <h3 className="text-base font-bold text-zinc-300 mb-1">لا توجد منشآت مسجلة في هذا التصنيف حالياً</h3>
          <p className="text-xs text-zinc-500 max-w-md mx-auto mb-4">
            {currentCategory ? `سيتم إضافة شركات ${currentCategory.name} قريباً فور اكتمال اعتمادها.` : 'جرّب تغيير خيارات البحث أو المدينة.'}
          </p>
          <button
            onClick={() => { setSelectedCategory('all'); setSelectedCity('all'); setSearchQuery(''); setSearchParams({}); }}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-xl border border-zinc-700 transition"
          >
            عرض كافة المنشآت
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBusinesses.slice(0, 3).map((item) => (
              <RealBusinessCard key={item.id} item={item} onSelect={() => navigate('/businesses/' + (item.slug || item.id))} />
            ))}
          </div>

          {/* 🌟 2. إعلان وسط القائمة (YR Ads In-Feed Native Unit) */}
          <div className="w-full my-6">
            <AdBanner placementId="2" className="rounded-2xl overflow-hidden shadow-lg border border-zinc-800/80" />
          </div>

          {filteredBusinesses.length > 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredBusinesses.slice(3).map((item) => (
                <RealBusinessCard key={item.id} item={item} onSelect={() => navigate('/businesses/' + (item.slug || item.id))} />
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

function RealBusinessCard({ item, onSelect }: { item: any; onSelect: () => void }) {
  const feat = item.sections_config?.features || {};
  const coverImg = item.cover_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&auto=format&fit=crop&q=80';
  const logoImg = item.logo_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80';

  return (
    <div className="bg-[#0B0F19] rounded-2xl border border-zinc-800/90 overflow-hidden hover:border-[#FFC500]/60 transition-all duration-300 flex flex-col justify-between group shadow-xl hover:-translate-y-1">
      <div>
        <div className="relative h-44 bg-zinc-900 overflow-hidden cursor-pointer" onClick={onSelect}>
          <img
            src={coverImg}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-black/40" />

          <div className="absolute bottom-3 right-3 w-14 h-14 rounded-xl bg-zinc-900/95 p-1 shadow-xl border border-zinc-700">
            <img src={logoImg} alt={item.name} className="w-full h-full object-contain rounded-lg" />
          </div>

          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            {item.is_verified ? (
              <span className="bg-emerald-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                <CheckCircle2 className="w-3 h-3" /> موثّق
              </span>
            ) : (
              <span className="bg-amber-500/90 text-zinc-950 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                <ShieldCheck className="w-3 h-3" /> غير مطالب به
              </span>
            )}
            <span className="bg-black/60 backdrop-blur-md text-amber-400 text-[11px] font-black px-2 py-0.5 rounded-lg flex items-center gap-1 border border-amber-500/20">
              <Star className="w-3 h-3 fill-amber-400" /> {Number(item.rating) || 4.8}
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
            <span className="truncate">{item.address || item.city || 'الجمهورية اليمنية'}</span>
          </p>

          <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed mb-4">
            {item.description || 'منشأة معتمدة تقدم خدمات راقية ومتميزة لعملائها بأعلى معايير الجودة والالتزام.'}
          </p>

          {/* شارات الميزات حسب النشاط */}
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
