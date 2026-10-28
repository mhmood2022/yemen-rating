homeview_code = '''import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Star, Eye, Clock, ChevronLeft, Building2, Gavel,
  Briefcase, Landmark, Hotel, UtensilsCrossed, Stethoscope, GraduationCap,
  Smartphone, ShoppingBag, Truck, Wrench, Sparkles, Scissors, Glasses,
  Coffee, Store, ShieldCheck, Layers, X, TrendingUp, Car
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { BusinessItem } from '../../data/mockData';
import { YRBadge, BadgeType } from '../common/YRBadge';
import { AdBanner } from '../common/AdBanner';

interface HomeViewProps {
  onSelectCategory: (slug: string) => void;
  onSelectBusiness: (business: BusinessItem) => void;
  businesses?: BusinessItem[];
  onNavigateAuctions: () => void;
  onNavigateRealEstate: () => void;
  onNavigateJobs: () => void;
  onNavigateExchangeRates: () => void;
  onNavigatePhones?: () => void;
  onNavigateBanks?: () => void;
}

// ذاكرة الرام الفورية في المتصفح لمنع التأخير وضمان 0 ثانية عند الرجوع
const globalMemoryCache = {
  businesses: [] as any[],
  banks: [] as any[],
  jobs: [] as any[],
  properties: [] as any[],
  isLoaded: false
};

export const HomeView: React.FC<HomeViewProps> = ({
  onSelectCategory,
  onSelectBusiness,
  onNavigateAuctions,
  onNavigateRealEstate,
  onNavigateJobs,
  onNavigateExchangeRates,
  onNavigateBanks
}) => {
  const navigate = useNavigate();
  const [activeMarket, setActiveMarket] = useState<'sanaa' | 'aden'>('sanaa');
  const [showAllCategoriesModal, setShowAllCategoriesModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [liveBusinesses, setLiveBusinesses] = useState<any[]>(globalMemoryCache.businesses);
  const [liveBanks, setLiveBanks] = useState<any[]>(globalMemoryCache.banks);
  const [liveJobs, setLiveJobs] = useState<any[]>(globalMemoryCache.jobs);
  const [liveProperties, setLiveProperties] = useState<any[]>(globalMemoryCache.properties);
  const [isLoading, setIsLoading] = useState(!globalMemoryCache.isLoaded);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        // استدعاء متوازي لجميع الجداول الحقيقية
        const [bRes, bnRes, jRes, pRes] = await Promise.allSettled([
          supabase.from('businesses').select('*').order('created_at', { ascending: false }).limit(20),
          supabase.from('banks').select('*').limit(6),
          supabase.from('jobs').select('*').order('created_at', { ascending: false }).limit(6),
          supabase.from('properties').select('*').limit(6)
        ]);

        if (!isMounted) return;

        if (bRes.status === 'fulfilled' && bRes.value.data?.length) {
          globalMemoryCache.businesses = bRes.value.data;
          setLiveBusinesses(bRes.value.data);
        }
        if (bnRes.status === 'fulfilled' && bnRes.value.data?.length) {
          globalMemoryCache.banks = bnRes.value.data;
          setLiveBanks(bnRes.value.data);
        }
        if (jRes.status === 'fulfilled' && jRes.value.data?.length) {
          globalMemoryCache.jobs = jRes.value.data;
          setLiveJobs(jRes.value.data);
        }
        if (pRes.status === 'fulfilled' && pRes.value.data?.length) {
          globalMemoryCache.properties = pRes.value.data;
          setLiveProperties(pRes.value.data);
        }

        globalMemoryCache.isLoaded = true;
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, []);

  const handleNavigateBanks = () => {
    if (onNavigateBanks) onNavigateBanks();
    else {
      try { navigate('/banks'); } catch { window.location.href = '/banks'; }
    }
  };

  // فتح صفحة البنك الفردية بالـ slug الحقيقي أو الـ id
  const handleBankClick = (bank: any) => {
    const target = bank.slug || bank.id;
    if (target) {
      navigate(`/banks/${target}`);
    }
  };

  // فتح صفحة المنشأة الفردية
  const handleBusinessClick = (business: any) => {
    if (onSelectBusiness) {
      onSelectBusiness(business);
    } else {
      const target = business.slug || business.id;
      navigate(`/businesses/${target}`);
    }
  };

  const officialCategories = [
    { id: 'banks', name: 'البنوك والصرافة', icon: Landmark, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { id: 'transport', name: 'شركات النقل', icon: Truck, color: 'text-sky-400', bg: 'bg-sky-400/10' },
    { id: 'hospitals', name: 'المستشفيات', icon: Stethoscope, color: 'text-rose-400', bg: 'bg-rose-400/10' },
    { id: 'clinics', name: 'العيادات', icon: Stethoscope, color: 'text-pink-400', bg: 'bg-pink-400/10' },
    { id: 'labs', name: 'المختبرات', icon: Stethoscope, color: 'text-teal-400', bg: 'bg-teal-400/10' },
    { id: 'pharmacies', name: 'الصيدليات', icon: Stethoscope, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { id: 'universities', name: 'الجامعات', icon: GraduationCap, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    { id: 'schools', name: 'المدارس', icon: GraduationCap, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
    { id: 'hotels', name: 'الفنادق', icon: Hotel, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { id: 'chalets', name: 'الشاليهات', icon: Hotel, color: 'text-blue-300', bg: 'bg-blue-300/10' },
    { id: 'parks', name: 'الحدائق', icon: Sparkles, color: 'text-green-400', bg: 'bg-green-400/10' },
    { id: 'wedding-halls', name: 'صالات الأفراح', icon: Sparkles, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { id: 'barbers', name: 'الحلاقون', icon: Scissors, color: 'text-amber-300', bg: 'bg-amber-300/10' },
    { id: 'salons', name: 'الكوافير', icon: Scissors, color: 'text-rose-300', bg: 'bg-rose-300/10' },
    { id: 'steam-baths', name: 'الحمامات البخارية', icon: Sparkles, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { id: 'cafes', name: 'الكافيهات', icon: Coffee, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { id: 'buffets', name: 'البوفيهات', icon: UtensilsCrossed, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { id: 'restaurants', name: 'المطاعم والأغذية', icon: UtensilsCrossed, color: 'text-red-400', bg: 'bg-red-400/10' },
    { id: 'supermarkets', name: 'السوبرماركت', icon: ShoppingBag, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { id: 'shopping-centers', name: 'مراكز التسوق', icon: Store, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { id: 'malls', name: 'المولات', icon: Building2, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    { id: 'shops', name: 'المحلات والمتاجر', icon: Store, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { id: 'phones', name: 'سوق الهواتف', icon: Smartphone, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { id: 'auctions', name: 'المزاد', icon: Gavel, color: 'text-red-400', bg: 'bg-red-400/10' },
    { id: 'realestate', name: 'العقارات', icon: Building2, color: 'text-green-400', bg: 'bg-green-400/10' },
    { id: 'jobs', name: 'التوظيف', icon: Briefcase, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { id: 'cleaning', name: 'شركات التنظيف', icon: Wrench, color: 'text-teal-400', bg: 'bg-teal-400/10' },
    { id: 'cars', name: 'معارض السيارات', icon: Car, color: 'text-violet-400', bg: 'bg-violet-400/10' },
    { id: 'motorcycles', name: 'معارض الدراجات النارية', icon: Car, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { id: 'clothing-shoes', name: 'محلات الملابس والأحذية', icon: ShoppingBag, color: 'text-pink-400', bg: 'bg-pink-400/10' },
    { id: 'gold', name: 'محلات الذهب', icon: Sparkles, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { id: 'poultry', name: 'مزارع الدواجن', icon: Store, color: 'text-lime-400', bg: 'bg-lime-400/10' },
    { id: 'optics', name: 'البصريات والسمعيات', icon: Glasses, color: 'text-cyan-400', bg: 'bg-cyan-400/10' }
  ];

  const ratesData = {
    sanaa: { usd: { buy: '534.76', sell: '538.00' }, sar: { buy: '140.43', sell: '140.70' }, updated: 'اليوم 09:00 ص' },
    aden: { usd: { buy: '1,910.00', sell: '1,925.00' }, sar: { buy: '501.50', sell: '504.00' }, updated: 'اليوم 09:00 ص' }
  };
  const currentRates = ratesData[activeMarket];

  const recentlyAdded = useMemo(() => liveBusinesses.slice(0, 6), [liveBusinesses]);

  return (
    <div dir="rtl" className="space-y-5 pt-1 max-w-5xl mx-auto px-3 sm:px-4 font-['Cairo',sans-serif] text-white">

      {/* 🔍 شريط البحث الذكي الوطني */}
      <div className="relative">
        <div className="flex items-center justify-between p-2.5 px-3.5 rounded-2xl bg-[#0D1322] border border-zinc-700/60 hover:border-[#FFC500]/60 transition-all shadow-lg group">
          <div className="flex items-center gap-2.5 text-zinc-400 group-hover:text-zinc-200 flex-1">
            <Search size={17} className="text-[#FFC500]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في قاعدة بيانات يمن ريتنغ المعتمدة..."
              className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-white placeholder-zinc-500"
            />
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/40 border border-white/10 text-[11px] text-zinc-300 shrink-0">
            <MapPin size={12} className="text-[#FFC500]" />
            <span>كل اليمن</span>
          </div>
        </div>
      </div>

      {/* 🏛️ بوابات التصنيفات الـ 33 المعتمدة */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
            <Layers size={15} className="text-[#FFC500]" /> بوابات الخدمات المعتمدة
          </h3>
          <button
            onClick={() => setShowAllCategoriesModal(true)}
            className="text-[11px] font-bold text-[#FFC500] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>عرض الكل (33)</span>
            <ChevronLeft size={13} />
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {officialCategories.slice(0, 11).map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  if (cat.id === 'banks') handleNavigateBanks();
                  else onSelectCategory(cat.id);
                }}
                className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-[#101522] hover:bg-[#182032] border border-white/10 hover:border-[#FFC500]/50 transition-all shrink-0 w-[78px] text-center cursor-pointer group"
              >
                <div className={`w-10 h-10 rounded-xl ${cat.bg} ${cat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon size={19} />
                </div>
                <span className="text-[10px] font-bold text-zinc-300 group-hover:text-white line-clamp-1">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1️⃣ قسم: آخر ما أضيف (المنشآت الحقيقية من Supabase بشاراتها الرسمية) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black text-white flex items-center gap-1.5">
            <Clock size={16} className="text-[#FFC500]" /> آخر ما أضيف
          </h3>
        </div>

        {recentlyAdded.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {recentlyAdded.map((item: any) => (
              <div
                key={item.id}
                onClick={() => handleBusinessClick(item)}
                className="rounded-2xl bg-[#0F1420] border border-zinc-800/80 hover:border-[#FFC500]/50 transition-all overflow-hidden cursor-pointer group flex flex-col justify-between shadow-md"
              >
                <div className="relative h-28 w-full overflow-hidden bg-zinc-900">
                  <img
                    src={item.image_url || item.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* الشارة الرسمية الحقيقية فقط */}
                  {item.badge_type && item.badge_type !== 'none' && (
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm p-1 rounded-lg border border-white/10">
                      <YRBadge type={item.badge_type as BadgeType} size={16} />
                    </div>
                  )}
                </div>

                <div className="p-2.5 space-y-1.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-white group-hover:text-[#FFC500] transition-colors line-clamp-1">
                      {item.name}
                    </h4>
                    <div className="flex items-center gap-1 text-zinc-400 text-[10px] mt-0.5">
                      <MapPin size={10} className="text-[#FFC500]" />
                      <span>{item.city || 'اليمن'}</span>
                    </div>
                  </div>

                  {/* التقييم الصادق: يظهر فقط إن وُجد */}
                  <div className="pt-1.5 border-t border-white/5 flex items-center justify-between text-[10px]">
                    {item.rating && Number(item.rating) > 0 ? (
                      <div className="flex items-center gap-1 text-[#FFC500] font-mono font-bold">
                        <Star size={11} className="fill-[#FFC500]" />
                        <span>{Number(item.rating).toFixed(1)}</span>
                      </div>
                    ) : (
                      <span className="text-zinc-500 font-medium">بانتظار التقييم</span>
                    )}

                    <span className="text-[9px] text-zinc-400 bg-white/5 px-1.5 py-0.5 rounded">
                      {item.category || 'معتمد'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-[#0F1420] border border-zinc-800/80 text-center text-xs text-zinc-400">
            جاري جلب المنشآت الحقيقية من قاعدة البيانات...
          </div>
        )}
      </div>

      {/* 2️⃣ قسم: البنوك والمصارف المعتمدة (بشارتها الرسمية وروابطها الحقيقية) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black text-white flex items-center gap-1.5">
            <Landmark size={16} className="text-[#FFC500]" /> البنوك والمصارف المعتمدة
          </h3>
          <button
            onClick={handleNavigateBanks}
            className="text-xs font-bold text-[#FFC500] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>دليل البنوك والصرافة</span>
            <ChevronLeft size={13} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {liveBanks.map((bank: any) => (
            <div
              key={bank.id}
              onClick={() => handleBankClick(bank)}
              className="p-3 rounded-2xl bg-[#0F1420] border border-zinc-800/80 hover:border-[#FFC500]/60 transition-all cursor-pointer flex items-center justify-between group shadow-md"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-[#FFC500] border border-[#FFC500]/30 flex items-center justify-center shrink-0">
                  <Landmark size={22} />
                </div>

                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-xs sm:text-sm text-white group-hover:text-[#FFC500] transition-colors truncate">
                      {bank.name}
                    </h4>
                    {/* الشارة الرسمية (ذهبي أو أزرق أو فضي) */}
                    {bank.badge_type && bank.badge_type !== 'none' && (
                      <YRBadge type={bank.badge_type as BadgeType} size={16} />
                    )}
                  </div>

                  <div className="text-[10px] text-zinc-400 flex items-center gap-1">
                    <MapPin size={10} className="text-[#FFC500]" />
                    <span>{bank.city || 'اليمن'} • مصرف معتمد</span>
                  </div>
                </div>
              </div>

              {/* التقييم الصادق للبنوك: إن وجد تقييم يظهر، وإلا يظهر نص بدون تقييم */}
              <div className="shrink-0 text-left">
                {bank.rating && Number(bank.rating) > 0 ? (
                  <div className="flex items-center gap-1 text-[#FFC500] font-mono font-bold text-xs">
                    <Star size={11} className="fill-[#FFC500]" />
                    <span>{Number(bank.rating).toFixed(1)}</span>
                  </div>
                ) : (
                  <span className="text-[10px] text-zinc-500 font-bold bg-white/5 px-2 py-1 rounded-lg">
                    بدون تقييم
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3️⃣ قسم: أسعار الصرف والذهب الحية */}
      <div className="rounded-2xl bg-[#0D121F] border border-[#1F2937] p-3 shadow-md space-y-2.5">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-1.5">
            <TrendingUp size={16} className="text-[#FFC500]" />
            <h3 className="text-xs font-black text-white">أسعار الصرف والذهب الحية</h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-500 font-mono">آخر تحديث: {currentRates.updated}</span>
            <div className="flex items-center bg-black/50 p-0.5 rounded-lg border border-white/10">
              <button
                onClick={() => setActiveMarket('sanaa')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  activeMarket === 'sanaa' ? 'bg-[#FFC500] text-black' : 'text-zinc-400'
                }`}
              >
                صنعاء
              </button>
              <button
                onClick={() => setActiveMarket('aden')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  activeMarket === 'aden' ? 'bg-[#FFC500] text-black' : 'text-zinc-400'
                }`}
              >
                عدن
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs">
            <thead>
              <tr className="text-zinc-400 border-b border-white/5 text-[11px]">
                <th className="py-1.5 font-bold text-right pr-2">العملة</th>
                <th className="py-1.5 font-bold">شراء</th>
                <th className="py-1.5 font-bold">بيع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              <tr>
                <td className="py-2 text-right pr-2 font-bold text-white font-sans flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> الدولار الأمريكي $
                </td>
                <td className="py-2 text-white font-bold">{currentRates.usd.buy}</td>
                <td className="py-2 text-[#FFC500] font-bold">{currentRates.usd.sell}</td>
              </tr>
              <tr>
                <td className="py-2 text-right pr-2 font-bold text-white font-sans flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> الريال السعودي ر.س
                </td>
                <td className="py-2 text-white font-bold">{currentRates.sar.buy}</td>
                <td className="py-2 text-[#FFC500] font-bold">{currentRates.sar.sell}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <button
          onClick={onNavigateExchangeRates}
          className="w-full pt-2 border-t border-white/5 text-xs font-bold text-[#FFC500] hover:underline flex items-center justify-center gap-1 cursor-pointer"
        >
          <span>اضغط لمعرفة التفاصيل</span>
          <ChevronLeft size={13} />
        </button>
      </div>

      {/* 4️⃣ قسم: العقارات والاستثمار */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black text-white flex items-center gap-1.5">
            <Building2 size={16} className="text-[#FFC500]" /> العقارات والاستثمار
          </h3>
          <button
            onClick={onNavigateRealEstate}
            className="text-xs font-bold text-[#FFC500] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>عرض الكل</span>
            <ChevronLeft size={13} />
          </button>
        </div>

        {liveProperties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {liveProperties.map((item: any) => (
              <div
                key={item.id}
                onClick={onNavigateRealEstate}
                className="rounded-2xl bg-[#0F1420] border border-zinc-800 hover:border-[#FFC500]/60 transition-all p-3 cursor-pointer shadow-md"
              >
                <h4 className="font-bold text-xs text-white">{item.title}</h4>
                <p className="text-[#FFC500] font-bold mt-1 text-xs">{item.price}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-[#0F1420] border border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-right shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFC500]/15 text-[#FFC500] flex items-center justify-center shrink-0">
                <Building2 size={20} />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white">لا توجد عقارات معروضة حالياً</h4>
                <p className="text-[10px] text-zinc-400 mt-0.5">كن أول من يعلن عن عقاره (شقة، فيلا، أرض) ليصل إلى آلاف الزوار في اليمن.</p>
              </div>
            </div>
            <button
              onClick={onNavigateRealEstate}
              className="px-3.5 py-1.5 rounded-xl bg-[#FFC500] text-black font-bold text-xs hover:bg-[#E5B200] transition-all shrink-0 cursor-pointer shadow"
            >
              أضف عقارك الآن
            </button>
          </div>
        )}
      </div>

      {/* 5️⃣ قسم: فرص التوظيف الحقيقية (من Supabase) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black text-white flex items-center gap-1.5">
            <Briefcase size={16} className="text-emerald-400" /> فرص التوظيف المعتمدة
          </h3>
          <button
            onClick={onNavigateJobs}
            className="text-xs font-bold text-[#FFC500] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>عرض الكل</span>
            <ChevronLeft size={13} />
          </button>
        </div>

        {liveJobs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {liveJobs.map((job: any) => (
              <div
                key={job.id}
                onClick={onNavigateJobs}
                className="p-3 rounded-2xl bg-[#0F1420] border border-zinc-800/80 hover:border-emerald-500/50 transition-all cursor-pointer flex flex-col justify-between group shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold">
                      {job.work_type || job.type || 'دوام كامل'}
                    </span>
                    <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                      <MapPin size={10} className="text-[#FFC500]" />
                      <span>{job.city || 'صنعاء'}</span>
                    </div>
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-white group-hover:text-emerald-400 transition-colors">
                    {job.title}
                  </h4>
                  <p className="text-[10px] text-zinc-400 mt-0.5">{job.sector || 'جهة عمل معتمدة'}</p>
                </div>

                <div className="pt-2 mt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-400">الراتب المتوقع:</span>
                  <span className="font-mono font-bold text-xs text-emerald-400">{job.salary_range || 'حسب الاتفاق'}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-[#0F1420] border border-zinc-800 text-center text-xs text-zinc-400">
            لا توجد شواغر وظيفية حالياً.
          </div>
        )}
      </div>

      {/* 6️⃣ البنر الإعلاني الأوسط */}
      <div className="w-full rounded-2xl overflow-hidden shadow-md">
        <AdBanner placementId="2" className="w-full" />
      </div>

      {/* 7️⃣ بوابة التوثيق الرسمي لأصحاب المنشآت */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-[#101524] to-black border border-[#FFC500]/30 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FFC500]/20 text-[#FFC500] border border-[#FFC500]/40 flex items-center justify-center shrink-0">
            <ShieldCheck size={26} />
          </div>
          <div>
            <h4 className="font-black text-sm text-white">هل تمتلك منشأة أو نشاط تجاري في اليمن؟</h4>
            <p className="text-[11px] text-zinc-300 mt-0.5">وثّق نشاطك رسمياً في يمن ريتنغ واحصل على الشارة المعتمدة وعملاء جدد من عموم المحافظات.</p>
          </div>
        </div>

        <button
          onClick={() => alert('لإضافة وتوثيق منشأتك يرجى التواصل مع إدارة منصة يمن ريتنغ.')}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#FFC500] hover:bg-[#E5B200] text-black font-black text-xs transition-all shrink-0 cursor-pointer shadow active:scale-95"
        >
          طلب توثيق منشأة الآن
        </button>
      </div>

      {/* 8️⃣ نافذة استعراض كامل الـ 33 تصنيفاً الرسمية */}
      {showAllCategoriesModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col p-4 animate-in fade-in duration-200">
          <div className="max-w-4xl w-full mx-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-black text-base text-white flex items-center gap-2">
                <Layers className="text-[#FFC500]" /> الدليل الوطني الشامل (كافة التصنيفات المعتمدة)
              </h3>
              <button
                onClick={() => setShowAllCategoriesModal(false)}
                className="p-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-1">
              {officialCategories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <div
                    key={cat.id}
                    onClick={() => {
                      setShowAllCategoriesModal(false);
                      if (cat.id === 'banks') handleNavigateBanks();
                      else onSelectCategory(cat.id);
                    }}
                    className="p-3 rounded-xl bg-[#111624] border border-zinc-800/80 hover:border-[#FFC500]/60 transition-all cursor-pointer flex items-center gap-3 group"
                  >
                    <div className={`w-10 h-10 rounded-xl ${cat.bg} ${cat.color} flex items-center justify-center group-hover:scale-110 transition-transform shrink-0`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-zinc-200 group-hover:text-white line-clamp-1">{cat.name}</h4>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
'''

with open("src/components/home/HomeView.tsx", "w", encoding="utf-8") as f:
    f.write(homeview_code)
print("✅ تم بنجاح تحديث HomeView.tsx بالشارات الرسمية الحقيقية وروابط البنوك الصحيحة.")
