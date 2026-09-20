import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search, MapPin, ChevronDown, Check, ArrowRight,
  Truck, HeartPulse, Stethoscope, Utensils, Bed, Store,
  Building, ShoppingBag, Car, Sparkles, GraduationCap,
  Loader2, Frown, Layers, ShieldCheck, ArrowLeft, Star
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { YRBadge, BadgeType } from '../../../components/common/YRBadge';
import { AdBanner } from '../../../components/common/AdBanner';
import { ClaimOwnershipModal } from '../../../components/business/ClaimOwnershipModal';

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
  const [reviewsMap, setReviewsMap] = useState<Map<string, { avg: number; count: number }>>(new Map());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  // مودال إثبات الملكية الحقيقي
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [selectedBusinessForClaim, setSelectedBusinessForClaim] = useState<{ id: string; name: string } | null>(null);

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

        const [bizRes, revRes] = await Promise.all([
          query.order('created_at', { ascending: false }),
          supabase.from('reviews').select('entity_id, stars')
        ]);

        if (bizRes.data) {
          setBusinesses(bizRes.data);
        }

        if (revRes.data) {
          const grouped = new Map<string, number[]>();
          revRes.data.forEach((r: any) => {
            if (r.entity_id) {
              const arr = grouped.get(r.entity_id) || [];
              const s = Number(r.stars);
              if (s >= 1 && s <= 5) arr.push(s);
              grouped.set(r.entity_id, arr);
            }
          });

          const map = new Map<string, { avg: number; count: number }>();
          grouped.forEach((arr, id) => {
            const count = arr.length;
            const avg = Number((arr.reduce((a, b) => a + b, 0) / count).toFixed(1));
            map.set(id, { avg, count });
          });
          setReviewsMap(map);
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

  const handleOpenClaim = (e: React.MouseEvent, b: any) => {
    e.stopPropagation();
    const targetSlug = b.slug || b.id;
    window.location.href = "/bank.html?slug=" + targetSlug + "&claim=true";
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#070A10] text-white font-['Cairo'] pb-16 px-3 sm:px-4 max-w-7xl mx-auto pt-1">
      {/* رأس الصفحة */}
      <div className="mb-2.5 flex items-center justify-between border-b border-[#1F2937]/70 pb-2">
        <div className="flex items-center gap-2 text-right">
          <CategoryIcon className="w-5 h-5 text-[#EAB308] shrink-0" />
          <h1 className="text-base sm:text-lg font-bold text-white leading-none">
            دليل {categoryConfig.name} ({businesses.length})
          </h1>
        </div>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-[#EAB308] hover:text-white p-1.5 bg-transparent border-0 transition cursor-pointer flex items-center justify-center"
          title="الرئيسية"
        >
          <ArrowRight size={20} strokeWidth={2.5} />
        </button>
      </div>

      {/* شريط الفلاتر السريعة */}
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

      {/* شريط البحث والمدينة */}
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
            عرض كافة منشآت الدليل
          </button>
        </div>
      ) : (
        /* شبكة الكروت المطابقة طبق الأصل لبنية كرت البنك الفاخر */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const rev = reviewsMap.get(item.id) || { avg: Number(item.rating || 0), count: 0 };
            const isUnclaimed = !item.is_verified || item.is_verified === 'false' || item.ownership_status === 'UNCLAIMED';

            return (
              <article
                key={item.id}
                onClick={() => navigate(`/businesses/${item.slug || item.id}`)}
                className="bg-[#0B0F17] font-['Cairo'] border border-zinc-800/90 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between transition hover:border-zinc-700 cursor-pointer group"
              >
                <div>
                  {/* الغلاف الواسع المفتوح بدون أي قص أو شارات فوقه */}
                  <div className="relative w-full h-48 bg-[#0B0F17] flex items-center justify-center overflow-hidden border-b border-zinc-800/40">
                    {item.cover_url || item.logo_url ? (
                      <img
                        src={item.cover_url || item.logo_url}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="h-full w-full bg-[#121620] flex items-center justify-center text-[#EAB308]">
                        <Building size={48} />
                      </div>
                    )}
                  </div>

                  {/* الشعار المربع وزر إثبات الملكية المتداخل بنفس هندسة كرت البنك */}
                  <div className="px-4 relative flex items-start justify-between -mt-5 mb-2">
                    <div className="relative z-10">
                      <div className="w-16 h-16 rounded-2xl bg-[#0B0F17] shadow-2xl border-2 border-[#1F2937] flex items-center justify-center overflow-hidden shrink-0">
                        {item.logo_url ? (
                          <img src={item.logo_url} alt={item.name} className="w-full h-full object-cover rounded-2xl" />
                        ) : (
                          <Building className="text-[#EAB308] text-2xl" size={26} />
                        )}
                      </div>
                    </div>

                    {isUnclaimed && (
                      <div>
                        <button
                          type="button"
                          onClick={(e) => handleOpenClaim(e, item)}
                          className="inline-flex items-center gap-1.5 bg-[#2A0E0E] hover:bg-[#3D1414] border border-[#661F1F] text-[#F87171] text-xs font-bold px-3 py-1.5 rounded-full shadow-md transition active:scale-95 cursor-pointer mt-2"
                        >
                          <ShieldCheck className="text-[#EF4444]" size={14} />
                          <span>إثبات ملكية الصفحة</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* البيانات الأساسية */}
                  <div className="px-4 pt-1 pb-3 text-right space-y-1.5">
                    {/* اسم المنشأة والشارة بجواره بمسافة مريحة */}
                    <div className="flex items-center justify-start gap-2">
                      <h2 className="text-sm sm:text-base font-black text-white leading-tight">{item.name}</h2>
                      {item.badge_type && item.badge_type !== 'none' && (
                        <YRBadge type={item.badge_type as BadgeType} size={18} />
                      )}
                    </div>

                    {/* الموقع الجغرافي */}
                    <div className="flex items-center justify-start gap-1 text-xs text-zinc-400">
                      <MapPin size={13} className="text-[#EAB308] shrink-0" />
                      <span>{item.city || item.address || 'اليمن'}</span>
                    </div>

                    {/* التقييم الحقيقي المماثل تماماً لكرت البنك */}
                    {rev.count > 0 ? (
                      <div className="flex items-center justify-start gap-1.5 text-xs font-bold pt-0.5">
                        <Star size={13} className="fill-[#EAB308] text-[#EAB308]" />
                        <span className="text-white font-mono font-bold">{rev.avg}</span>
                        <span className="text-zinc-400 text-[11px] font-normal">({rev.count} تقييم)</span>
                      </div>
                    ) : (
                      <div className="text-right pt-0.5">
                        <span className="text-zinc-500 text-xs font-normal">لا توجد تقييمات بعد</span>
                      </div>
                    )}

                    {item.description && (
                      <p className="text-xs text-zinc-300 leading-relaxed pt-1 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* زر العرض الأصفر العريض المعتمد */}
                <div className="p-4 pt-1">
                  <button
                    type="button"
                    onClick={() => navigate(`/businesses/${item.slug || item.id}`)}
                    className="w-full py-2.5 rounded-xl bg-[#EAB308] hover:bg-[#CA8A04] text-black font-black text-sm flex items-center justify-center gap-2 shadow transition active:scale-98 cursor-pointer font-['Cairo']"
                  >
                    <span>عرض صفحة المنشأة</span>
                    <ArrowLeft size={15} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* نافذة إثبات الملكية التفاعلية الحقيقية */}
      {claimModalOpen && selectedBusinessForClaim && (
        <ClaimOwnershipModal
          isOpen={claimModalOpen}
          onClose={() => setClaimModalOpen(false)}
          onSuccess={() => alert('تم إرسال طلب إثبات الملكية بنجاح')}
          businessId={selectedBusinessForClaim.id}
          businessName={selectedBusinessForClaim.name}
        />
      )}

      <div className="w-full mt-6">
        <AdBanner placementId="2" className="w-full !rounded-none" />
      </div>
    </div>
  );
};

export default BusinessesPage;
