import React, { useState } from 'react';
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
  ArrowRight
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

  const displayedCategories = showAllCategories 
    ? OFFICIAL_CATEGORIES 
    : OFFICIAL_CATEGORIES.slice(0, 8);

  const marketRates = {
    sanaa: {
      sar: { buy: '140.20', sell: '140.70', change: '+0.15%', isUp: true },
      usd: { buy: '535.00', sell: '538.00', change: '-0.20%', isUp: false },
      gold24: { buy: '42,500', sell: '44,200', change: '+0.50%', isUp: true }
    },
    aden: {
      sar: { buy: '495.00', sell: '500.00', change: '+0.80%', isUp: true },
      usd: { buy: '1,890.00', sell: '1,910.00', change: '+1.10%', isUp: true },
      gold24: { buy: '148,000', sell: '155,000', change: '+0.95%', isUp: true }
    }
  };

  const currentHomeRates = marketRates[activeMarketHome];

  return (
    <div dir="rtl" className="space-y-8 pb-16">
      
      {/* 1. Hero Promo Banner Card */}
      <div className="relative overflow-hidden rounded-3xl bg-[#151515] border border-[#262626] shadow-2xl">
        <div className="relative h-48 sm:h-56 md:h-64 w-full">
          <img
            src="https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=1400&auto=format&fit=crop&q=80"
            alt="صنعاء القديمة"
            className="w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-[#151515] via-[#151515]/85 to-transparent" />
          
          <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between z-10 max-w-lg">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f5c400]/10 border border-[#f5c400]/30 text-[#f5c400] text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>الدليل الوطني الشامل لتقييم الخدمات</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-black text-white leading-tight">
                اكتشف، قيّم، وتصفح أفضل الخدمات في مدينتك
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 line-clamp-2">
                تقييمات حقيقية من المجتمع لأفضل الشركات والأنشطة التجارية في اليمن
              </p>
            </div>

            <div>
              <button
                onClick={() => onSelectCategory('restaurants')}
                className="px-6 py-2.5 bg-[#f5c400] hover:bg-amber-300 text-zinc-950 font-bold text-xs sm:text-sm rounded-xl transition-transform active:scale-95 shadow-lg shadow-[#f5c400]/10"
              >
                استكشف الدليل الآن
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. التصنيفات الرئيسية الـ 26 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2 h-5 bg-[#f5c400] rounded-sm"></span>
            <span>التصنيفات الرئيسية</span>
            <span className="text-xs bg-[#181818] border border-[#2a2a2a] text-[#f5c400] px-2.5 py-0.5 rounded-lg font-mono">
              26 تصنيفاً
            </span>
          </h3>
          <button
            onClick={() => setShowAllCategories(!showAllCategories)}
            className="text-xs text-[#f5c400] hover:underline font-bold flex items-center gap-1"
          >
            <span>{showAllCategories ? 'عرض أقل' : 'عرض الكل'}</span>
            {showAllCategories ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4">
          {displayedCategories.map((cat: CategoryItem) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.slug)}
                className="flex flex-col items-start p-4 rounded-2xl bg-[#151515] border border-[#262626] hover:border-[#f5c400]/50 hover:bg-[#181818] transition-all group text-right shadow-md active:scale-98"
              >
                <div className="w-10 h-10 rounded-xl bg-[#202020] group-hover:bg-[#f5c400] text-[#f5c400] group-hover:text-zinc-950 flex items-center justify-center transition-colors mb-2.5">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="font-bold text-xs sm:text-sm text-zinc-100 group-hover:text-[#f5c400] transition-colors line-clamp-1">
                  {cat.name}
                </span>

                {/* Subcategories Chips */}
                {cat.subcategories && cat.subcategories.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap mt-2.5 pt-2 border-t border-[#222222] w-full">
                    {cat.subcategories.slice(0, 2).map((sub) => (
                      <span
                        key={sub.id}
                        className="text-[10px] text-zinc-400 bg-[#0d0d0d] px-2 py-0.5 rounded-md border border-[#242424] truncate max-w-[95px]"
                      >
                        {sub.name}
                      </span>
                    ))}
                    {cat.subcategories.length > 2 && (
                      <span className="text-[10px] text-[#f5c400] font-mono font-bold">
                        +{cat.subcategories.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. أسعار العملات والذهب بالألوان المالية (أخضر للشراء وأحمر للبيع) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">أسعار العملات والذهب</h3>
          </div>

          <button
            onClick={onNavigateExchangeRates}
            className="text-xs text-[#f5c400] hover:underline font-bold flex items-center gap-1"
          >
            <span>التفاصيل والحاسبة</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="rounded-3xl bg-[#151515] border border-[#262626] p-4 sm:p-5 space-y-4 shadow-xl">
          
          <div className="flex items-center justify-between gap-2 border-b border-[#242424] pb-3">
            <div className="flex items-center gap-2 bg-[#0d0d0d] p-1 rounded-xl border border-[#222]">
              <button
                onClick={() => setActiveMarketHome('sanaa')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeMarketHome === 'sanaa'
                    ? 'bg-[#f5c400] text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                أسعار صنعاء
              </button>
              <button
                onClick={() => setActiveMarketHome('aden')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeMarketHome === 'aden'
                    ? 'bg-[#f5c400] text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                أسعار عدن
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>مباشر</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* 1. الريال السعودي */}
            <div className="bg-[#0d0d0d] p-3.5 rounded-2xl border border-[#222] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-zinc-400" />
                  الريال السعودي (SAR)
                </span>
                <span className={`inline-flex items-center gap-0.5 text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg ${
                  currentHomeRates.sar.isUp ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  {currentHomeRates.sar.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {currentHomeRates.sar.change}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1e1e1e]">
                <div>
                  <span className="text-[10px] text-zinc-500 block">شراء (YER)</span>
                  <span className="text-base font-extrabold text-emerald-400 font-mono tracking-tight">{currentHomeRates.sar.buy}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block">بيع (YER)</span>
                  <span className="text-base font-extrabold text-rose-400 font-mono tracking-tight">{currentHomeRates.sar.sell}</span>
                </div>
              </div>
            </div>

            {/* 2. الدولار الأمريكي */}
            <div className="bg-[#0d0d0d] p-3.5 rounded-2xl border border-[#222] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-zinc-400" />
                  الدولار الأمريكي (USD)
                </span>
                <span className={`inline-flex items-center gap-0.5 text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg ${
                  currentHomeRates.usd.isUp ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  {currentHomeRates.usd.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {currentHomeRates.usd.change}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1e1e1e]">
                <div>
                  <span className="text-[10px] text-zinc-500 block">شراء (YER)</span>
                  <span className="text-base font-extrabold text-emerald-400 font-mono tracking-tight">{currentHomeRates.usd.buy}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block">بيع (YER)</span>
                  <span className="text-base font-extrabold text-rose-400 font-mono tracking-tight">{currentHomeRates.usd.sell}</span>
                </div>
              </div>
            </div>

            {/* 3. الذهب عيار 24 */}
            <div className="bg-[#0d0d0d] p-3.5 rounded-2xl border border-[#222] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-zinc-400" />
                  الذهب عيار 24 (جرام)
                </span>
                <span className={`inline-flex items-center gap-0.5 text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg ${
                  currentHomeRates.gold24.isUp ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  {currentHomeRates.gold24.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {currentHomeRates.gold24.change}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1e1e1e]">
                <div>
                  <span className="text-[10px] text-zinc-500 block">شراء (YER)</span>
                  <span className="text-base font-extrabold text-emerald-400 font-mono tracking-tight">{currentHomeRates.gold24.buy}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block">بيع (YER)</span>
                  <span className="text-base font-extrabold text-rose-400 font-mono tracking-tight">{currentHomeRates.gold24.sell}</span>
                </div>
              </div>
            </div>

          </div>

          <div className="text-center text-xs text-zinc-400 pt-1 flex items-center justify-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-[#f5c400]" />
            <span>الأسعار بالريال اليمني • تحديث فوري من محلات الصرافة والذهب المعتمدة</span>
          </div>

        </div>
      </div>

      {/* 4. منشآت وخدمات مميزة وموثقة (الأعلى تقييماً) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#f5c400]" />
            <span>منشآت وخدمات موثقة ومميزة</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {businesses.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectBusiness(item)}
              className="bg-[#151515] hover:bg-[#181818] border border-[#262626] hover:border-[#f5c400]/40 rounded-3xl p-4 sm:p-5 flex gap-4 transition-all cursor-pointer group shadow-xl"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#202020] overflow-hidden flex-shrink-0 border border-[#2a2a2a]">
                <img src={item.logo} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="font-bold text-xs sm:text-sm text-white group-hover:text-[#f5c400] transition-colors truncate">
                      {item.name}
                    </h4>
                    {item.isVerified && (
                      <VerifiedBadge type={item.badgeType} size="sm" />
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1">{item.description}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#222222] text-xs">
                  <span className="flex items-center gap-1 text-[#f5c400] font-bold">
                    <Star className="w-3.5 h-3.5 fill-[#f5c400]" />
                    {item.rating}
                  </span>
                  <span className="text-zinc-500 text-[11px] truncate flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#f5c400] flex-shrink-0" />
                    {item.address}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. المزادات الحية */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Gavel className="w-4 h-4 text-[#f5c400]" />
            <span>المزادات الحية</span>
          </h3>
          <button
            onClick={onNavigateAuctions}
            className="text-xs text-[#f5c400] hover:underline font-bold flex items-center gap-1"
          >
            <span>عرض كل المزادات</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            onClick={onNavigateAuctions}
            className="rounded-3xl bg-[#151515] border border-[#262626] p-4 flex gap-4 cursor-pointer group hover:border-[#f5c400]/40 transition-all shadow-xl"
          >
            <div className="w-24 h-24 rounded-2xl bg-[#202020] overflow-hidden flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400&auto=format&fit=crop&q=80"
                alt="مزاد سيارة"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="flex-1 flex flex-col justify-between min-w-0">
              <div>
                <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-md font-bold">مباشر</span>
                <h4 className="font-bold text-xs sm:text-sm text-white truncate mt-1.5 group-hover:text-[#f5c400]">تويوتا لاندكروزر V8 2022 وكالة</h4>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">أعلى مزايدة: 48,500 $</p>
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-[#222222]">
                <span className="flex items-center gap-1 text-[#f5c400] font-mono"><Clock className="w-3.5 h-3.5" /> 04:18:22</span>
                <span className="text-[#f5c400] font-bold">دخول المزاد ←</span>
              </div>
            </div>
          </div>

          <div
            onClick={onNavigateAuctions}
            className="rounded-3xl bg-[#151515] border border-[#262626] p-4 flex gap-4 cursor-pointer group hover:border-[#f5c400]/40 transition-all shadow-xl"
          >
            <div className="w-24 h-24 rounded-2xl bg-[#202020] overflow-hidden flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&auto=format&fit=crop&q=80"
                alt="مزاد عقار"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="flex-1 flex flex-col justify-between min-w-0">
              <div>
                <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-md font-bold">مباشر</span>
                <h4 className="font-bold text-xs sm:text-sm text-white truncate mt-1.5 group-hover:text-[#f5c400]">أرض تجارية 6 لبن شارع الستين</h4>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">أعلى مزايدة: 185,000,000 YER</p>
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-[#222222]">
                <span className="flex items-center gap-1 text-[#f5c400] font-mono"><Clock className="w-3.5 h-3.5" /> 01:12:45</span>
                <span className="text-[#f5c400] font-bold">دخول المزاد ←</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. العقارات المميزة */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Building className="w-4 h-4 text-[#f5c400]" />
            <span>العقارات المميزة</span>
          </h3>
          <button
            onClick={onNavigateRealEstate}
            className="text-xs text-[#f5c400] hover:underline font-bold flex items-center gap-1"
          >
            <span>عرض كل العقارات</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            onClick={onNavigateRealEstate}
            className="p-4 rounded-3xl bg-[#151515] border border-[#262626] flex items-center gap-4 cursor-pointer group hover:border-[#f5c400]/40 transition-all shadow-xl"
          >
            <div className="w-20 h-20 rounded-2xl bg-[#202020] overflow-hidden flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&auto=format&fit=crop&q=80"
                alt="عقار للإيجار"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md font-semibold">للإيجار</span>
                <span className="text-xs sm:text-sm font-bold text-[#f5c400] font-mono">400 $/شهر</span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-white truncate mt-1 group-hover:text-[#f5c400]">شقة سوبر ديلوكس حدة - صنعاء</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">3 غرف · 2 حمام · 160 م²</p>
            </div>
          </div>

          <div
            onClick={onNavigateRealEstate}
            className="p-4 rounded-3xl bg-[#151515] border border-[#262626] flex items-center gap-4 cursor-pointer group hover:border-[#f5c400]/40 transition-all shadow-xl"
          >
            <div className="w-20 h-20 rounded-2xl bg-[#202020] overflow-hidden flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&auto=format&fit=crop&q=80"
                alt="فيلا للبيع"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md font-semibold">للبيع</span>
                <span className="text-xs sm:text-sm font-bold text-[#f5c400] font-mono">280,000 $</span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-white truncate mt-1 group-hover:text-[#f5c400]">فيلا مستقلة مودرن إنماء عدن</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">5 غرف · مسبح · 450 م²</p>
            </div>
          </div>
        </div>
      </div>

      {/* 7. أحدث الوظائف */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-[#f5c400]" />
            <span>أحدث الوظائف</span>
          </h3>
          <button
            onClick={onNavigateJobs}
            className="text-xs text-[#f5c400] hover:underline font-bold flex items-center gap-1"
          >
            <span>عرض كل الوظائف</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          <div
            onClick={onNavigateJobs}
            className="p-4 rounded-2xl bg-[#151515] border border-[#262626] hover:border-[#f5c400]/40 transition-all flex items-center justify-between cursor-pointer group shadow-md"
          >
            <div className="space-y-1 min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-[#f5c400]">
                مطور واجهات أمامية (React / TypeScript)
              </h4>
              <p className="text-[11px] text-zinc-400">شركة يمن سوفت للحلول البرمجية · صنعاء</p>
            </div>
            <span className="text-xs font-bold text-[#f5c400] font-mono flex-shrink-0">
              800$ - 1200$
            </span>
          </div>

          <div
            onClick={onNavigateJobs}
            className="p-4 rounded-2xl bg-[#151515] border border-[#262626] hover:border-[#f5c400]/40 transition-all flex items-center justify-between cursor-pointer group shadow-md"
          >
            <div className="space-y-1 min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-[#f5c400]">
                محاسب مالي أول (Senior Accountant)
              </h4>
              <p className="text-[11px] text-zinc-400">مجموعة هائل سعيد أنعم · عدن</p>
            </div>
            <span className="text-xs font-bold text-[#f5c400] flex-shrink-0">
              دوام كامل
            </span>
          </div>
        </div>
      </div>

      {/* 8. آخر التقييمات والمراجعات */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Star className="w-4 h-4 text-[#f5c400]" />
            <span>آخر التقييمات والمراجعات</span>
          </h3>
          <span className="text-xs text-zinc-400">آراء حقيقية من المجتمع</span>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-[#151515] border border-[#262626] flex items-start gap-4 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-[#202020] overflow-hidden flex-shrink-0">
            <img
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&auto=format&fit=crop&q=80"
              alt="مطعم رويال ستار"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-white">أبو محمد الأهدل</span>
              <span className="text-[11px] text-zinc-500">منذ ساعتين</span>
            </div>
            <div className="text-[#f5c400] text-xs">★★★★★</div>
            <p className="text-xs text-zinc-300 leading-relaxed pt-0.5">
              تجربة ممتازة في مطعم رويال ستار، المأكولات البحرية طازجة والخدمة راقية جداً وسريعة.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
