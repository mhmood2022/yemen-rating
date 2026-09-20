import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Star, ChevronDown, Check, ArrowRight,
  Truck, HeartPulse, Stethoscope, Utensils, Bed, Store,
  Building, ShoppingBag, Car, Sparkles, GraduationCap,
  Scissors, Gem, Loader2, Frown, Layers
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { YRBadge, BadgeType } from '../../../components/common/YRBadge';
import { AdBanner } from '../../../components/common/AdBanner';

export const CATEGORY_CONFIG: { [slug: string]: { name: string; icon: any } } = {
  'all': { name: 'المنشآت والشركات', icon: Layers },
  'transport': { name: 'شركات النقل', icon: Truck },
  'hospitals': { name: 'المستشفيات', icon: HeartPulse },
  'clinics': { name: 'العيادات', icon: Stethoscope },
  'pharmacies': { name: 'الصيدليات', icon: Stethoscope },
  'laboratories': { name: 'المختبرات', icon: Stethoscope },
  'restaurants': { name: 'المطاعم والأغذية', icon: Utensils },
  'cafes': { name: 'الكافيهات', icon: Utensils },
  'hotels': { name: 'الفنادق', icon: Bed },
  'chalets': { name: 'الشاليهات', icon: Bed },
  'schools': { name: 'المدارس', icon: GraduationCap },
  'universities': { name: 'الجامعات', icon: GraduationCap },
  'supermarkets': { name: 'السوبرماركت', icon: Store },
  'shopping-centers': { name: 'مراكز التسوق', icon: ShoppingBag },
  'parks': { name: 'الحدائق', icon: Sparkles },
  'wedding-halls': { name: 'صالات الأفراح', icon: Sparkles },
  'car-dealerships': { name: 'معارض السيارات', icon: Car },
  'cleaning-companies': { name: 'شركات التنظيف', icon: Sparkles }
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
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const rawCat = searchParams.get('category');
  const currentCategorySlug = (!rawCat || rawCat === 'companies' || rawCat === 'directory') ? 'all' : rawCat;

  const categoryConfig = CATEGORY_CONFIG[currentCategorySlug] || { name: 'دليل المنشآت والشركات', icon: Layers };
  const CategoryIcon = categoryConfig.icon;

  const [businesses, setBusinesses] = useState<any[]>([]);
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
      setLoading(true);
      try {
        let query = supabase.from('businesses').select('*');

        if (currentCategorySlug !== 'all') {
          const { data: catData } = await supabase.from('categories').select('id, name, slug');
          const matchedCat = (catData || []).find(
            c => c.slug === currentCategorySlug || c.id === currentCategorySlug || c.name === currentCategorySlug
          );
          if (matchedCat) {
            query = query.eq('category_id', matchedCat.id);
          }
        }

        const { data, error } = await query.order('created_at', { ascending: false });
        if (!error && data) {
          setBusinesses(data);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [currentCategorySlug]);

  const filtered = businesses.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      (item.name || '').toLowerCase().includes(q) ||
      (item.description || '').toLowerCase().includes(q);
    const matchesCity = selectedCity === 'all' || item.city === selectedCity;
    return matchesSearch && matchesCity;
  });

  const selectedCityName = CITIES_LIST.find(c => c.id === selectedCity)?.name || 'كل المدن والمحافظات';

  const quickFilterTabs = [
    { id: 'all', name: 'الكل' },
    { id: 'hotels', name: 'فنادق' },
    { id: 'chalets', name: 'شاليهات' },
    { id: 'pharmacies', name: 'صيدليات' },
    { id: 'hospitals', name: 'مستشفيات' },
    { id: 'schools', name: 'مدارس' },
    { id: 'transport', name: 'نقل' }
  ];

  return (
    <div dir="rtl" className="min-h-screen bg-[#070A10] text-white font-['Cairo',sans-serif] pb-16 px-3 sm:px-4 max-w-7xl mx-auto pt-3">
      <div className="mb-4 flex items-center justify-between border-b border-[#1F2937]/70 pb-3">
        <div className="flex items-center gap-2 text-right">
          <CategoryIcon className="w-6 h-6 text-[#EAB308] shrink-0" />
          <h1 className="text-xl sm:text-2xl font-black text-white leading-none">
            دليل {categoryConfig.name} ({businesses.length})
          </h1>
        </div>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-[#EAB308] hover:text-white p-1.5 bg-transparent border-0 transition cursor-pointer flex items-center justify-center"
          title="الرئيسية"
        >
          <ArrowRight size={24} strokeWidth={2.5} />
        </button>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
        {quickFilterTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setSearchParams({ category: tab.id })}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer border ${
              currentCategorySlug === tab.id
                ? 'bg-[#EAB308] text-black border-[#EAB308]'
                : 'bg-[#0B0F17] text-zinc-300 border-[#1F2937] hover:border-[#EAB308]/50'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4 bg-[#0B0F17] p-2.5 rounded-2xl border border-[#1F2937]">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={`ابحث في المنشآت والخدمات...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#121620] border border-[#1F2937] focus:border-[#EAB308] text-zinc-200 pr-10 pl-3 py-2.5 rounded-xl text-xs outline-none transition"
          />
        </div>

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

      {loading ? (
        <div className="py-16 text-center flex flex-col items-center justify-center">
          <Loader2 className="w-7 h-7 animate-spin text-[#EAB308] mb-2" />
          <p className="text-xs text-zinc-400 font-bold">جاري تحميل المنشآت الحقيقية...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-zinc-500 bg-[#0B0F17] rounded-2xl border border-[#1F2937] space-y-3">
          <Frown className="w-10 h-10 mx-auto text-zinc-600 stroke-[1.5]" />
          <p className="text-xs font-bold">لا توجد منشآت مطابقة في هذا التصنيف حالياً</p>
          <button
            onClick={() => setSearchParams({ category: 'all' })}
            className="px-4 py-1.5 rounded-xl bg-[#EAB308] text-black font-bold text-xs cursor-pointer"
          >
            عرض كافة منشآت الدليل (23)
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/businesses/${item.slug || item.id}`)}
              className="bg-[#0B0F17] border border-[#1F2937] hover:border-[#EAB308]/60 transition-all rounded-2xl overflow-hidden cursor-pointer flex flex-col justify-between group shadow-lg"
            >
              <div className="relative h-40 w-full overflow-hidden bg-zinc-900">
                {item.cover_url || item.logo_url ? (
                  <img
                    src={item.cover_url || item.logo_url}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="h-full w-full bg-[#121620] flex items-center justify-center text-[#EAB308]">
                    <Building size={42} />
                  </div>
                )}

              </div>

              <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white group-hover:text-[#EAB308] transition-colors truncate flex items-center gap-1.5">
                    <span className="truncate">{item.name}</span>
                    {item.badge_type && item.badge_type !== 'none' && (
                      <YRBadge type={item.badge_type as BadgeType} size={15} />
                    )}
                  </h3>
                  <div className="flex items-center gap-1 text-[11px] text-zinc-400 mt-1">
                    <MapPin size={12} className="text-[#EAB308]" />
                    <span>{item.city || 'اليمن'}</span>
                  </div>
                  {item.description && (
                    <p className="text-[11px] text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="pt-2.5 border-t border-white/5 flex items-center justify-between">
                  {item.rating && Number(item.rating) > 0 ? (
                    <div className="flex items-center gap-1 text-[#EAB308]">
                      <Star size={13} className="fill-[#EAB308]" />
                      <span className="text-xs font-mono font-bold">{Number(item.rating).toFixed(1)}</span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-zinc-500 font-medium">لا توجد تقييمات</span>
                  )}

                  <button className="px-3.5 py-1.5 rounded-xl bg-[#EAB308] hover:bg-amber-400 text-black font-bold text-xs transition cursor-pointer">
                    عرض التفاصيل
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="w-full mt-6">
        <AdBanner placementId="2" className="w-full !rounded-none" />
      </div>
    </div>
  );
};
