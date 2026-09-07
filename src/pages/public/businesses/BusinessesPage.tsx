import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search, MapPin, Phone, ArrowRight, Star,
  CheckCircle2, Bed, Wifi, Car, Truck, Users, Gem,
  Waves, Loader2, Frown, Stethoscope, Store, MessageCircle
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

  useEffect(() => {
    let isMounted = true;
    const fetchCategoryBusinesses = async () => {
      setLoading(true);
      try {
        let query = supabase.from('businesses').select('*');

        if (categoryParam !== 'all') {
          // جلب الـ UUID الخاص بالتصنيف
          const { data: catRow } = await supabase
            .from('categories')
            .select('id, slug')
            .eq('slug', categoryParam)
            .maybeSingle();

          if (catRow && catRow.id) {
            query = query.eq('category_id', catRow.id);
          } else {
            // إذا لم يكن UUID نبحث بالقيمة كـ slug
            query = query.eq('category_id', categoryParam);
          }
        }

        const { data, error } = await query
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (!error && data && isMounted) {
          setBusinesses(data);
        } else if (isMounted) {
          console.error('Supabase query error:', error);
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

      {/* رأس الصفحة المطابق للهوية مع زر الرجوع في مكانه الصحيح */}
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

      {/* قائمة المنشآت */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filtered.slice(0, 3).map((item) => (
              <CleanBusinessCard key={item.id} item={item} onSelect={() => navigate('/businesses/' + (item.slug || item.id))} />
            ))}
          </div>

          <AdBanner placementId="2" className="my-3" />

          {filtered.length > 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filtered.slice(3).map((item) => (
                <CleanBusinessCard key={item.id} item={item} onSelect={() => navigate('/businesses/' + (item.slug || item.id))} />
              ))}
            </div>
          )}
        </div>
      )}

      <AdBanner placementId="3" className="mt-4" />
    </div>
  );
};

function CleanBusinessCard({ item, onSelect }: { item: any; onSelect: () => void }) {
  const feat = item.sections_config?.features || {};
  const hasRating = Number(item.rating) > 0;

  return (
    <div className="bg-[#0B0F19] rounded-2xl border border-[#1F2937] overflow-hidden hover:border-[#FFC500]/50 transition flex flex-col justify-between">
      <div>
        <div className="relative h-40 bg-zinc-900 overflow-hidden cursor-pointer" onClick={onSelect}>
          {item.cover_url && (
            <img src={item.cover_url} alt={item.name} className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent" />

          {item.logo_url && (
            <div className="absolute bottom-2.5 right-2.5 w-12 h-12 rounded-xl bg-zinc-900 p-1 border border-[#1F2937]">
              <img src={item.logo_url} alt={item.name} className="w-full h-full object-contain rounded-lg" />
            </div>
          )}

          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
            {item.is_verified === true && (
              <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> موثّق
              </span>
            )}
            {hasRating && (
              <span className="bg-black/70 text-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 border border-amber-500/20">
                <Star className="w-3 h-3 fill-amber-400" /> {Number(item.rating).toFixed(1)}
              </span>
            )}
          </div>
        </div>

        <div className="p-3.5">
          <h3 onClick={onSelect} className="font-bold text-sm text-white hover:text-[#FFC500] transition truncate cursor-pointer">
            {item.name}
          </h3>

          {(item.city || item.address) && (
            <p className="text-[11px] text-zinc-400 flex items-center gap-1 mt-1 mb-2">
              <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
              <span className="truncate">{item.address || item.city}</span>
            </p>
          )}

          {item.description && (
            <p className="text-[11px] text-zinc-300 line-clamp-2 leading-relaxed mb-2.5">
              {item.description}
            </p>
          )}

          <div className="flex flex-wrap gap-1">
            {feat.rooms_count > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 text-amber-300 border border-zinc-800 flex items-center gap-1">
                <Bed className="w-2.5 h-2.5" /> {feat.rooms_count} غرفة
              </span>
            )}
            {feat.has_pool && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                <Waves className="w-2.5 h-2.5" /> مسبح
              </span>
            )}
            {feat.has_wifi && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                <Wifi className="w-2.5 h-2.5" /> واي فاي
              </span>
            )}
            {feat.has_emergency && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1">
                <Stethoscope className="w-2.5 h-2.5" /> طوارئ 24 س
              </span>
            )}
            {feat.has_delivery && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <Truck className="w-2.5 h-2.5" /> توصيل
              </span>
            )}
            {feat.has_family_sections && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                <Users className="w-2.5 h-2.5" /> عوائل
              </span>
            )}
            {feat.gold_carat && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 flex items-center gap-1">
                <Gem className="w-2.5 h-2.5" /> عيار {feat.gold_carat}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-2.5 bg-zinc-900/50 border-t border-[#1F2937] flex items-center gap-2">
        {item.phone && (
          <a href={`tel:${item.phone}`} className="flex-1 text-center py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition">
            <Phone className="w-3 h-3 text-blue-400" /> اتصال
          </a>
        )}
        {(item.whatsapp || item.phone) && (
          <a href={`https://wa.me/${(item.whatsapp || item.phone).replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="flex-1 text-center py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition">
            <MessageCircle className="w-3 h-3" /> واتساب
          </a>
        )}
        <button onClick={onSelect} className="px-3 py-1.5 bg-[#FFC500] hover:bg-amber-400 text-black font-bold rounded-lg text-xs transition">
          التفاصيل
        </button>
      </div>
    </div>
  );
}
