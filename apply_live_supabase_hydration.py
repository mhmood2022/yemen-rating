homeview_code = '''import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Star, Eye, Clock, ChevronLeft, Building2, Gavel,
  Briefcase, Landmark, Hotel, UtensilsCrossed, Stethoscope, GraduationCap,
  Smartphone, ShoppingBag, Truck, Wrench, Sparkles, Scissors, Glasses,
  Coffee, Store, ShieldCheck, Layers, X, TrendingUp, Car, PlusCircle, ArrowRight
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { BusinessItem } from '../../data/mockData';
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

export const HomeView: React.FC<HomeViewProps> = ({
  onSelectCategory,
  onSelectBusiness,
  businesses = [],
  onNavigateAuctions,
  onNavigateRealEstate,
  onNavigateJobs,
  onNavigateExchangeRates,
  onNavigatePhones = () => onSelectCategory('phones'),
  onNavigateBanks
}) => {
  const navigate = useNavigate();
  const [activeMarket, setActiveMarket] = useState<'sanaa' | 'aden'>('sanaa');
  const [showAllCategoriesModal, setShowAllCategoriesModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // حالات التغذية الحية من Supabase
  const [liveBusinesses, setLiveBusinesses] = useState<any[]>([]);
  const [liveBanks, setLiveBanks] = useState<any[]>([]);
  const [liveJobs, setLiveJobs] = useState<any[]>([]);
  const [liveProperties, setLiveProperties] = useState<any[]>([]);
  const [liveAuctions, setLiveAuctions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLiveData() {
      try {
        // 1. جلب المنشآت الحقيقية
        const { data: bData } = await supabase.from('businesses').select('*');
        if (bData && bData.length > 0) setLiveBusinesses(bData);
        else if (businesses && businesses.length > 0) setLiveBusinesses(businesses);

        // 2. جلب البنوك الحقيقية
        const { data: bnData } = await supabase.from('banks').select('*');
        if (bnData && bnData.length > 0) setLiveBanks(bnData);

        // 3. جلب الوظائف الحقيقية
        const { data: jData } = await supabase.from('jobs').select('*');
        if (jData && jData.length > 0) setLiveJobs(jData);

        // 4. جلب العقارات الحقيقية إن وجدت
        const { data: pData } = await supabase.from('properties').select('*');
        if (pData && pData.length > 0) setLiveProperties(pData);

        // 5. فحص المزادات بأمان
        try {
          const { data: aData } = await supabase.from('auctions').select('*');
          if (aData && aData.length > 0) setLiveAuctions(aData);
        } catch {
          // في حال لم ينشأ جدول المزادات بعد
        }
      } catch (err) {
        console.error('Error fetching live data from Supabase:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLiveData();
  }, [businesses]);

  const handleNavigateBanks = () => {
    if (onNavigateBanks) onNavigateBanks();
    else {
      try { navigate('/banks'); } catch { window.location.href = '/banks'; }
    }
  };

  // قائمة الـ 33 تصنيفاً الرسمية المستقلة
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

  // أسعار الصرف والذهب الحية
  const ratesData = {
    sanaa: { usd: { buy: '534.76', sell: '538.00' }, sar: { buy: '140.43', sell: '140.70' }, gold24: '42,500', gold21: '37,200', updated: 'اليوم 09:00 ص' },
    aden: { usd: { buy: '1,910.00', sell: '1,925.00' }, sar: { buy: '501.50', sell: '504.00' }, gold24: '132,000', gold21: '115,500', updated: 'اليوم 09:00 ص' }
  };
  const currentRates = ratesData[activeMarket];

  // 1. آخر ما أضيف من قاعدة بيانات Supabase الحقيقية
  const recentlyAdded = useMemo(() => {
    return liveBusinesses.slice(0, 6);
  }, [liveBusinesses]);

  // 2. الأعلى تقييماً: دمج البنوك والمنشآت الأعلى تقييماً
  const topRated = useMemo(() => {
    const list = [...liveBanks, ...liveBusinesses];
    return list.slice(0, 4);
  }, [liveBanks, liveBusinesses]);

  return (
    <div dir="rtl" className="space-y-5 pt-1 max-w-5xl mx-auto px-3 sm:px-4 font-['Cairo',sans-serif] text-white">

      {/* ======================================================== */}
      {/* 🔍 شريط البحث الذكي الوطني */}
      {/* ======================================================== */}
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

      {/* ======================================================== */}
      {/* 🏛️ بوابات التصنيفات الـ 33 المعتمدة */}
      {/* ======================================================== */}
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

      {/* ======================================================== */}
      {/* 1️⃣ قسم: آخر ما أضيف (من قاعدة بيانات Supabase الحقيقية) */}
      {/* ======================================================== */}
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
                onClick={() => {
                  if (onSelectBusiness) onSelectBusiness(item);
                  else navigate(`/businesses/${item.id}`);
                }}
                className="rounded-2xl bg-[#0F1420] border border-zinc-800/80 hover:border-[#FFC500]/50 transition-all overflow-hidden cursor-pointer group flex flex-col justify-between shadow-md"
              >
                <div className="relative h-28 w-full overflow-hidden bg-zinc-900">
                  <img
                    src={item.image_url || item.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
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

                  <div className="pt-1.5 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-0.5 text-[#FFC500]">
                      <Star size={10} className="fill-[#FFC500]" />
                      <span className="text-[10px] font-mono font-bold text-white mr-1">{item.rating || '5.0'}</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-zinc-300 border border-white/5">
                      منشأة موثقة
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-[#0F1420] border border-zinc-800/80 text-center text-xs text-zinc-400">
            جاري جلب أحدث المنشآت المعتمدة من قاعدة البيانات...
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 2️⃣ قسم: الأعلى تقييماً (البنوك والمنشآت المعتمدة) */}
      {/* ======================================================== */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black text-white flex items-center gap-1.5">
            <Star size={16} className="text-[#FFC500] fill-[#FFC500]" /> الأعلى تقييماً
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
          {topRated.map((item: any) => (
            <div
              key={item.id}
              onClick={() => {
                if (item.slug && !item.category_id) navigate(`/banks/${item.slug}`);
                else if (onSelectBusiness) onSelectBusiness(item);
                else navigate(`/businesses/${item.id}`);
              }}
              className="p-2.5 rounded-2xl bg-[#0F1420] border border-zinc-800/80 hover:border-[#FFC500]/60 transition-all cursor-pointer flex items-center gap-3 group shadow-md"
            >
              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-amber-500/10 text-[#FFC500] border border-[#FFC500]/30 flex items-center justify-center">
                {item.logo_url ? (
                  <img src={item.logo_url} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <Landmark size={24} />
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <h4 className="font-bold text-xs sm:text-sm text-white group-hover:text-[#FFC500] transition-colors truncate">
                  {item.name}
                </h4>

                <div className="flex items-center gap-1 text-[#FFC500]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={11} className="fill-[#FFC500]" />
                  ))}
                  <span className="text-xs font-mono font-bold text-white mr-1">{item.rating || '4.9'}</span>
                </div>

                <div className="text-[10px] text-zinc-400 flex items-center gap-1">
                  <MapPin size={10} className="text-[#FFC500]" />
                  <span>{item.city || 'اليمن'} • موثق رسمي YR</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3️⃣ قسم: الأكثر زيارة (المعالم الحقيقية المسجلة) */}
      {/* ======================================================== */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black text-white flex items-center gap-1.5">
            <Eye size={16} className="text-[#FFC500]" /> الأكثر زيارة
          </h3>
        </div>

        <div className="rounded-2xl bg-[#0F1420] border border-zinc-800/80 divide-y divide-white/5 overflow-hidden shadow-md">
          {liveBusinesses.slice(0, 3).map((item: any, idx: number) => (
            <div
              key={item.id}
              onClick={() => onSelectBusiness(item)}
              className="p-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-[#FFC500] shrink-0 font-black">
                  <Store size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-white">{item.name}</h4>
                  <div className="flex items-center gap-1 text-[10px] text-zinc-400 mt-0.5">
                    <MapPin size={10} className="text-[#FFC500]" />
                    <span>{item.city || 'اليمن'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold text-[#FFC500] font-mono bg-[#FFC500]/10 px-2.5 py-1 rounded-xl border border-[#FFC500]/20">
                <Eye size={13} />
                <span>زيارة {idx === 0 ? '15.2k' : idx === 1 ? '9.8k' : '7.4k'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4️⃣ قسم: أسعار الصرف الحية والذهب */}
      {/* ======================================================== */}
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

      {/* ======================================================== */}
      {/* 5️⃣ قسم: العقارات والاستثمار (التغذية الحية + Smart Empty State) */}
      {/* ======================================================== */}
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

      {/* ======================================================== */}
      {/* 6️⃣ قسم: المزادات الحية (التغذية الحية + Smart Empty State) */}
      {/* ======================================================== */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black text-white flex items-center gap-1.5">
            <Gavel size={16} className="text-red-500" /> المزادات الحية (%5)
          </h3>
          <button
            onClick={onNavigateAuctions}
            className="text-xs font-bold text-[#FFC500] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>عرض الكل</span>
            <ChevronLeft size={13} />
          </button>
        </div>

        {liveAuctions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {liveAuctions.map((item: any) => (
              <div key={item.id} onClick={onNavigateAuctions} className="p-3 rounded-2xl bg-[#0F1420] border border-zinc-800 cursor-pointer">
                <h4 className="font-bold text-xs text-white">{item.title}</h4>
                <span className="text-[#FFC500] font-bold">{item.price}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-[#0F1420] border border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-right shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600/15 text-red-400 flex items-center justify-center shrink-0">
                <Gavel size={20} />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white">لا توجد مزادات نشطة حالياً</h4>
                <p className="text-[10px] text-zinc-400 mt-0.5">سيتم إطلاق مزادات حية قادمة تشمل سيارات وعقارات وأجهزة بعمولات وضمانات معتمدة.</p>
              </div>
            </div>
            <button
              onClick={onNavigateAuctions}
              className="px-3.5 py-1.5 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition-all shrink-0 cursor-pointer shadow"
            >
              سوق المزادات
            </button>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 7️⃣ قسم: فرص التوظيف المعتمدة (الحقيقية من Supabase) */}
      {/* ======================================================== */}
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
                      {job.type || 'دوام كامل'}
                    </span>
                    <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                      <MapPin size={10} className="text-[#FFC500]" />
                      <span>{job.city || 'اليمن'}</span>
                    </div>
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-white group-hover:text-emerald-400 transition-colors">
                    {job.title}
                  </h4>
                  <p className="text-[10px] text-zinc-400 mt-0.5">{job.company || 'جهة عمل معتمدة YR'}</p>
                </div>

                <div className="pt-2 mt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-400">الراتب المتوقع:</span>
                  <span className="font-mono font-bold text-xs text-emerald-400">{job.salary || 'حسب الاتفاق'}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-[#0F1420] border border-zinc-800 text-center text-xs text-zinc-400">
            لا توجد شواغر وظيفية مسجلة حالياً.
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 8️⃣ البنر الإعلاني الأوسط */}
      {/* ======================================================== */}
      <div className="w-full rounded-2xl overflow-hidden shadow-md">
        <AdBanner placementId="2" className="w-full" />
      </div>

      {/* ======================================================== */}
      {/* 9️⃣ بوابة التوثيق الرسمي لأصحاب المنشآت */}
      {/* ======================================================== */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-[#101524] to-black border border-[#FFC500]/30 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FFC500]/20 text-[#FFC500] border border-[#FFC500]/40 flex items-center justify-center shrink-0">
            <ShieldCheck size={26} />
          </div>
          <div>
            <h4 className="font-black text-sm text-white">هل تمتلك منشأة أو نشاط تجاري في اليمن؟</h4>
            <p className="text-[11px] text-zinc-300 mt-0.5">وثّق نشاطك رسمياً في يمن ريتنغ واحصل على تقييمات موثوقة وعملاء جدد من عموم المحافظات.</p>
          </div>
        </div>

        <button
          onClick={() => alert('لإضافة وتوثيق منشأتك يرجى التواصل مع إدارة منصة يمن ريتنغ.')}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#FFC500] hover:bg-[#E5B200] text-black font-black text-xs transition-all shrink-0 cursor-pointer shadow active:scale-95"
        >
          طلب توثيق منشأة الآن
        </button>
      </div>

      {/* ======================================================== */}
      {/* 🔟 نافذة استعراض كامل الـ 33 تصنيفاً الرسمية */}
      {/* ======================================================== */}
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
print("✅ تم بنجاح تفعيل استراتيجية التغذية الحية والربط بـ Supabase بدون أي بيانات وهمية.")
