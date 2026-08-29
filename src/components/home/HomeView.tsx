import React, { useState, useEffect } from 'react';
import { 
  Star, 
  MapPin, 
  Clock, 
  Gavel, 
  Building, 
  Briefcase, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw, 
  Coins, 
  DollarSign, 
  ArrowRight,
  BedDouble,
  Bath,
  Maximize2
} from 'lucide-react';
import { OFFICIAL_CATEGORIES, CategoryItem } from '../../data/categories';
import { BusinessItem } from '../../data/mockData';
import { VerifiedBadge } from '../common/VerifiedBadge';

interface HomeViewProps {
  onSelectCategory: (slug: string) => void;
  onSelectBusiness: (business: BusinessItem) => void;
  businesses: BusinessItem[];
  onNavigateAuctions: () => void;
  onNavigateRealEstate: () => void;
  onNavigateJobs: () => void;
  onNavigateExchangeRates: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onSelectCategory,
  onSelectBusiness,
  businesses,
  onNavigateAuctions,
  onNavigateRealEstate,
  onNavigateJobs,
  onNavigateExchangeRates
}) => {
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [activeMarketHome, setActiveMarketHome] = useState<'sanaa' | 'aden'>('sanaa');
  const [livePulse, setLivePulse] = useState(false);

  // تحديث وميض الأسعار اللحظي كل 4 ثوانٍ
  useEffect(() => {
    const timer = setInterval(() => {
      setLivePulse(true);
      setTimeout(() => setLivePulse(false), 800);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const displayedCategories = showAllCategories 
    ? OFFICIAL_CATEGORIES 
    : OFFICIAL_CATEGORIES.slice(0, 8);

  const marketRates = {
    sanaa: {
      sar: { buy: '140.20', sell: '140.70', change: '+0.15%', isUp: true },
      usd: { buy: '535.00', sell: '538.00', change: '-0.20%', isUp: false },
      gold24: { buy: '42,500', sell: '44,200', change: '+0.50%', isUp: true },
      gold18: { buy: '31,800', sell: '33,500', change: '+0.40%', isUp: true }
    },
    aden: {
      sar: { buy: '495.00', sell: '500.00', change: '+0.80%', isUp: true },
      usd: { buy: '1,890.00', sell: '1,910.00', change: '+1.10%', isUp: true },
      gold24: { buy: '148,000', sell: '155,000', change: '+0.95%', isUp: true },
      gold18: { buy: '111,000', sell: '119,000', change: '+0.70%', isUp: true }
    }
  };

  const currentHomeRates = marketRates[activeMarketHome];

  return (
    <div dir="rtl" className="space-y-6 pb-20 pt-1 max-w-6xl mx-auto">
      
      {/* 1. Hero Promo Banner Card */}
      <div className="relative overflow-hidden rounded-3xl bg-[#151515] border border-[#242424] shadow-2xl">
        <div className="relative min-h-[180px] sm:min-h-[220px] w-full flex items-center">
          <img
            src="https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=1400&auto=format&fit=crop&q=80"
            alt="صنعاء القديمة"
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-[#151515] via-[#151515]/90 to-transparent" />
          
          <div className="relative p-5 sm:p-7 flex flex-col justify-between z-10 max-w-lg space-y-3">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#f5b800]/10 border border-[#f5b800]/30 text-[#f5b800] text-[11px] font-bold">
                <Sparkles className="w-3 h-3" />
                <span>دليل اليمن الشامل</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white leading-snug">
                اكتشف أفضل الأنشطة والخدمات في مدينتك
              </h2>
              <p className="text-xs text-zinc-300 leading-relaxed line-clamp-2">
                تقييمات حقيقية من المجتمع لأفضل الشركات والمطاعم والخدمات
              </p>
            </div>

            <div>
              <button
                onClick={() => onSelectCategory('restaurants')}
                className="px-5 py-2 bg-[#f5b800] hover:bg-[#e5aa00] text-zinc-950 font-bold text-xs rounded-xl transition-transform active:scale-95 shadow-md shadow-[#f5b800]/20"
              >
                استكشف الدليل الآن
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. التصنيفات الرئيسية */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-[#f5b800] rounded-full" />
            <h3 className="text-sm sm:text-base font-bold text-white">التصنيفات الرئيسية</h3>
            <span className="text-[10px] bg-[#181818] border border-[#262626] text-[#f5b800] px-2 py-0.5 rounded-md font-mono font-bold">
              26
            </span>
          </div>

          <button
            onClick={() => setShowAllCategories(!showAllCategories)}
            className="text-xs text-[#f5b800] hover:underline font-bold flex items-center gap-1"
          >
            <span>{showAllCategories ? 'عرض أقل' : 'عرض الكل'}</span>
            {showAllCategories ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5 sm:gap-3">
          {displayedCategories.map((cat: CategoryItem) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.slug)}
                className="h-20 sm:h-24 rounded-2xl bg-[#161616] border border-[#242424] hover:border-[#f5b800]/50 p-2 flex flex-col items-center justify-center gap-1.5 transition-all group shadow-sm active:scale-95"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#202020] group-hover:bg-[#f5b800] text-[#f5b800] group-hover:text-zinc-950 flex items-center justify-center transition-colors flex-shrink-0">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-zinc-200 group-hover:text-[#f5b800] truncate w-full text-center">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. 📈 أسعار العملات والذهب (بطاقة تفاعلية قابلة للنقر والانتقال لصفحة الأسعار) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div 
            onClick={onNavigateExchangeRates}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-[#f5b800] transition-colors">
              أسعار العملات والذهب
            </h3>
          </div>

          <button
            onClick={onNavigateExchangeRates}
            className="text-xs text-[#f5b800] hover:underline font-bold flex items-center gap-1"
          >
            <span>البورصة والحاسبة</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* البطاقة المالية الكبيرة - عند النقر عليها تفتح قسم الأسعار بالكامل */}
        <div 
          onClick={onNavigateExchangeRates}
          className="rounded-3xl bg-[#121620]/90 border border-white/[0.08] hover:border-[#f5b800]/50 p-3.5 sm:p-5 space-y-3.5 shadow-xl glass cursor-pointer transition-all group"
        >
          
          <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] pb-2.5">
            <div 
              onClick={(e) => e.stopPropagation()} 
              className="flex items-center gap-1.5 bg-[#090d16] p-1 rounded-xl border border-white/10"
            >
              <button
                onClick={() => setActiveMarketHome('sanaa')}
                className={`px-3.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  activeMarketHome === 'sanaa'
                    ? 'bg-[#f5b800] text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                أسعار صنعاء
              </button>
              <button
                onClick={() => setActiveMarketHome('aden')}
                className={`px-3.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  activeMarketHome === 'aden'
                    ? 'bg-[#f5b800] text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                أسعار عدن
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              <span className={`w-1.5 h-1.5 rounded-full bg-emerald-400 ${livePulse ? 'scale-150 ring-4 ring-emerald-500/40' : 'animate-pulse'} transition-all`} />
              <span>مباشر</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            
            {/* الريال السعودي */}
            <div className="bg-[#090d16] p-3 rounded-2xl border border-[#1a2133] group-hover:border-[#2b354d] space-y-1.5 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1">
                  <span>🇸🇦</span>
                  <span>السعودي</span>
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1 py-0.2 rounded">
                  {currentHomeRates.sar.change}
                </span>
              </div>
              <div className="pt-1 border-t border-white/[0.06]">
                <div className="flex justify-between text-[11px]">
                  <span className="text-zinc-400">شراء:</span>
                  <span className="font-mono font-extrabold text-emerald-400">{currentHomeRates.sar.buy}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-zinc-400">بيع:</span>
                  <span className="font-mono font-extrabold text-rose-400">{currentHomeRates.sar.sell}</span>
                </div>
              </div>
            </div>

            {/* الدولار الأمريكي */}
            <div className="bg-[#090d16] p-3 rounded-2xl border border-[#1a2133] group-hover:border-[#2b354d] space-y-1.5 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1">
                  <span>🇺🇸</span>
                  <span>الدولار</span>
                </span>
                <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 px-1 py-0.2 rounded">
                  {currentHomeRates.usd.change}
                </span>
              </div>
              <div className="pt-1 border-t border-white/[0.06]">
                <div className="flex justify-between text-[11px]">
                  <span className="text-zinc-400">شراء:</span>
                  <span className="font-mono font-extrabold text-emerald-400">{currentHomeRates.usd.buy}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-zinc-400">بيع:</span>
                  <span className="font-mono font-extrabold text-rose-400">{currentHomeRates.usd.sell}</span>
                </div>
              </div>
            </div>

            {/* الذهب عيار 24 */}
            <div className="bg-[#090d16] p-3 rounded-2xl border border-[#1a2133] group-hover:border-[#2b354d] space-y-1.5 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1">
                  <span>🟡</span>
                  <span>ذهب 24</span>
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1 py-0.2 rounded">
                  {currentHomeRates.gold24.change}
                </span>
              </div>
              <div className="pt-1 border-t border-white/[0.06]">
                <div className="flex justify-between text-[11px]">
                  <span className="text-zinc-400">شراء:</span>
                  <span className="font-mono font-extrabold text-emerald-400">{currentHomeRates.gold24.buy}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-zinc-400">بيع:</span>
                  <span className="font-mono font-extrabold text-rose-400">{currentHomeRates.gold24.sell}</span>
                </div>
              </div>
            </div>

            {/* الذهب عيار 18 */}
            <div className="bg-[#090d16] p-3 rounded-2xl border border-[#1a2133] group-hover:border-[#2b354d] space-y-1.5 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1">
                  <span>🪙</span>
                  <span>ذهب 18</span>
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1 py-0.2 rounded">
                  {currentHomeRates.gold18.change}
                </span>
              </div>
              <div className="pt-1 border-t border-white/[0.06]">
                <div className="flex justify-between text-[11px]">
                  <span className="text-zinc-400">شراء:</span>
                  <span className="font-mono font-extrabold text-emerald-400">{currentHomeRates.gold18.buy}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-zinc-400">بيع:</span>
                  <span className="font-mono font-extrabold text-rose-400">{currentHomeRates.gold18.sell}</span>
                </div>
              </div>
            </div>

          </div>

          <div className="text-center text-[11px] text-zinc-400 pt-0.5 flex items-center justify-center gap-1 font-mono group-hover:text-[#f5b800] transition-colors">
            <RefreshCw className={`w-3 h-3 text-[#f5b800] ${livePulse ? 'animate-spin' : ''}`} />
            <span>انقر لمعاينة البورصة الكاملة والحاسبة الفورية بالريال اليمني ←</span>
          </div>

        </div>
      </div>

      {/* 4. منشآت وخدمات مميزة */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#f5b800]" />
            <span>منشآت وخدمات موثقة ومميزة</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {businesses.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectBusiness(item)}
              className="bg-[#151515] hover:bg-[#181818] border border-[#242424] hover:border-[#f5b800]/40 rounded-3xl p-3.5 sm:p-4 flex gap-3.5 transition-all cursor-pointer group shadow-xl"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#202020] overflow-hidden flex-shrink-0 border border-[#282828]">
                <img src={item.logo} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="font-bold text-xs sm:text-sm text-white group-hover:text-[#f5b800] transition-colors truncate">
                      {item.name}
                    </h4>
                    {item.isVerified && (
                      <VerifiedBadge type={item.badgeType} size="sm" />
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1">{item.description}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#202020] text-xs">
                  <span className="flex items-center gap-1 text-[#f5b800] font-bold">
                    <Star className="w-3.5 h-3.5 fill-[#f5b800]" />
                    {item.rating}
                  </span>
                  <span className="text-zinc-500 text-[11px] truncate flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#f5b800] flex-shrink-0" />
                    {item.address}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. المزادات الحية */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
            <Gavel className="w-4 h-4 text-[#f5b800]" />
            <span>المزادات الحية</span>
          </h3>
          <button
            onClick={onNavigateAuctions}
            className="text-xs text-[#f5b800] hover:underline font-bold flex items-center gap-1"
          >
            <span>عرض الكل</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div
            onClick={onNavigateAuctions}
            className="rounded-2xl bg-[#161616] border border-[#242424] overflow-hidden cursor-pointer group hover:border-[#f5b800]/40 transition-all shadow-xl flex flex-col"
          >
            <div className="relative h-40 sm:h-44 w-full bg-[#202020] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80"
                alt="مزاد سيارة"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2.5 right-2.5 bg-zinc-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-zinc-800 text-xs font-mono font-bold text-[#f5b800] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>04:18:22</span>
              </div>
              <div className="absolute top-2.5 left-2.5 bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-md text-[10px] font-bold">
                مباشر
              </div>
            </div>

            <div className="p-3.5 flex flex-col justify-between flex-1 space-y-2">
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-white group-hover:text-[#f5b800] truncate">
                  تويوتا لاندكروزر V8 2022 وكالة
                </h4>
                <p className="text-xs text-emerald-400 font-mono font-bold mt-1">
                  أعلى مزايدة: 182,000 SAR
                </p>
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-[#202020]">
                <span>صنعاء</span>
                <span className="text-[#f5b800] font-bold">دخول المزاد ←</span>
              </div>
            </div>
          </div>

          <div
            onClick={onNavigateAuctions}
            className="rounded-2xl bg-[#161616] border border-[#242424] overflow-hidden cursor-pointer group hover:border-[#f5b800]/40 transition-all shadow-xl flex flex-col"
          >
            <div className="relative h-40 sm:h-44 w-full bg-[#202020] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80"
                alt="مزاد عقار"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2.5 right-2.5 bg-zinc-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-zinc-800 text-xs font-mono font-bold text-[#f5b800] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>01:12:45</span>
              </div>
              <div className="absolute top-2.5 left-2.5 bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-md text-[10px] font-bold">
                مباشر
              </div>
            </div>

            <div className="p-3.5 flex flex-col justify-between flex-1 space-y-2">
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-white group-hover:text-[#f5b800] truncate">
                  أرض تجارية 6 لبن شارع الستين
                </h4>
                <p className="text-xs text-emerald-400 font-mono font-bold mt-1">
                  أعلى مزايدة: 185,000,000 YER
                </p>
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-[#202020]">
                <span>صنعاء</span>
                <span className="text-[#f5b800] font-bold">دخول المزاد ←</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. العقارات المميزة */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
            <Building className="w-4 h-4 text-[#f5b800]" />
            <span>العقارات المميزة</span>
          </h3>
          <button
            onClick={onNavigateRealEstate}
            className="text-xs text-[#f5b800] hover:underline font-bold flex items-center gap-1"
          >
            <span>عرض الكل</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div
            onClick={onNavigateRealEstate}
            className="rounded-2xl bg-[#161616] border border-[#242424] overflow-hidden cursor-pointer group hover:border-[#f5b800]/40 transition-all shadow-xl flex flex-col"
          >
            <div className="relative h-40 sm:h-44 w-full bg-[#202020] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80"
                alt="شقة للإيجار"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2.5 right-2.5 bg-zinc-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-zinc-800 text-xs font-mono font-bold text-[#f5b800]">
                400 $/شهر
              </div>
              <div className="absolute top-2.5 left-2.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-md text-[10px] font-bold">
                للإيجار
              </div>
            </div>

            <div className="p-3.5 flex flex-col justify-between flex-1 space-y-2">
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-white group-hover:text-[#f5b800] truncate">
                  شقة سوبر ديلوكس حدة - صنعاء
                </h4>
                <div className="flex items-center gap-3 text-[11px] text-zinc-400 mt-1.5">
                  <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5 text-[#f5b800]" /> 3 غرف</span>
                  <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5 text-[#f5b800]" /> 2 حمام</span>
                  <span className="flex items-center gap-1"><Maximize2 className="w-3.5 h-3.5 text-[#f5b800]" /> 160 م²</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-[#202020]">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-[#f5b800]" /> صنعاء، حدة</span>
                <span className="text-[#f5b800] font-bold">معاينة العقار ←</span>
              </div>
            </div>
          </div>

          <div
            onClick={onNavigateRealEstate}
            className="rounded-2xl bg-[#161616] border border-[#242424] overflow-hidden cursor-pointer group hover:border-[#f5b800]/40 transition-all shadow-xl flex flex-col"
          >
            <div className="relative h-40 sm:h-44 w-full bg-[#202020] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80"
                alt="فيلا للبيع"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2.5 right-2.5 bg-zinc-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-zinc-800 text-xs font-mono font-bold text-[#f5b800]">
                280,000 $
              </div>
              <div className="absolute top-2.5 left-2.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-md text-[10px] font-bold">
                للبيع
              </div>
            </div>

            <div className="p-3.5 flex flex-col justify-between flex-1 space-y-2">
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-white group-hover:text-[#f5b800] truncate">
                  فيلا مستقلة مودرن إنماء عدن
                </h4>
                <div className="flex items-center gap-3 text-[11px] text-zinc-400 mt-1.5">
                  <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5 text-[#f5b800]" /> 5 غرف</span>
                  <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5 text-[#f5b800]" /> 4 حمام</span>
                  <span className="flex items-center gap-1"><Maximize2 className="w-3.5 h-3.5 text-[#f5b800]" /> 450 م²</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-[#202020]">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-[#f5b800]" /> عدن، إنماء</span>
                <span className="text-[#f5b800] font-bold">معاينة العقار ←</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 7. أحدث الوظائف */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-[#f5b800]" />
            <span>أحدث الوظائف</span>
          </h3>
          <button
            onClick={onNavigateJobs}
            className="text-xs text-[#f5b800] hover:underline font-bold flex items-center gap-1"
          >
            <span>عرض الكل</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2.5">
          <div
            onClick={onNavigateJobs}
            className="p-3.5 rounded-2xl bg-[#161616] border border-[#242424] hover:border-[#f5b800]/40 transition-all flex items-center justify-between cursor-pointer group shadow-md"
          >
            <div className="space-y-1 min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-[#f5b800]">
                مطور واجهات أمامية (React / TypeScript)
              </h4>
              <p className="text-[11px] text-zinc-400">شركة يمن سوفت للحلول البرمجية · صنعاء</p>
            </div>
            <span className="text-xs font-bold text-[#f5b800] font-mono flex-shrink-0">
              800$ - 1200$
            </span>
          </div>

          <div
            onClick={onNavigateJobs}
            className="p-3.5 rounded-2xl bg-[#161616] border border-[#242424] hover:border-[#f5b800]/40 transition-all flex items-center justify-between cursor-pointer group shadow-md"
          >
            <div className="space-y-1 min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-[#f5b800]">
                محاسب مالي أول (Senior Accountant)
              </h4>
              <p className="text-[11px] text-zinc-400">مجموعة هائل سعيد أنعم · عدن</p>
            </div>
            <span className="text-xs font-bold text-[#f5b800] flex-shrink-0">
              دوام كامل
            </span>
          </div>
        </div>
      </div>

      {/* 8. آخر التقييمات */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
            <Star className="w-4 h-4 text-[#f5b800]" />
            <span>آخر التقييمات والمراجعات</span>
          </h3>
          <span className="text-xs text-zinc-400">آراء حقيقية</span>
        </div>

        <div className="p-3.5 sm:p-4 rounded-3xl bg-[#161616] border border-[#242424] flex items-start gap-3.5 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-[#202020] overflow-hidden flex-shrink-0">
            <img
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&auto=format&fit=crop&q=80"
              alt="مطعم رويال ستار"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">أبو محمد الأهدل</span>
              <span className="text-[10px] text-zinc-500">منذ ساعتين</span>
            </div>
            <div className="text-[#f5b800] text-xs">★★★★★</div>
            <p className="text-xs text-zinc-300 leading-relaxed pt-0.5">
              تجربة ممتازة في مطعم رويال ستار، المأكولات البحرية طازجة والخدمة راقية جداً وسريعة.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
