import React, { useState } from 'react';
import { 
  Star, MapPin, Clock, Gavel, Building, Briefcase, 
  TrendingUp, TrendingDown, Sparkles, ChevronDown, ChevronUp, 
  RefreshCw, Coins, ArrowRight, BedDouble, Bath, Maximize2, 
  Flame, Tag, Smartphone, ShieldCheck, ChevronLeft, Search
} from 'lucide-react';
import { OFFICIAL_CATEGORIES, CategoryItem } from '../../data/categories';
import { BusinessItem } from '../../data/mockData';
import { AdBanner } from '../common/AdBanner';

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
  const [activeMarket, setActiveMarket] = useState<'sanaa' | 'aden'>('sanaa');
  const [calcAmount, setCalcAmount] = useState<number>(100);
  const [calcCurrency, setCalcCurrency] = useState<'USD' | 'SAR'>('USD');

  // حساب محول الصرف المباشر
  const sanaaRate = calcCurrency === 'USD' ? 538 : 140.8;
  const adenRate = calcCurrency === 'USD' ? 1925 : 504;
  const sanaaTotal = Math.round(calcAmount * sanaaRate);
  const adenTotal = Math.round(calcAmount * adenRate);
  const diffTotal = adenTotal - sanaaTotal;

  const displayedCategories = showAllCategories 
    ? OFFICIAL_CATEGORIES 
    : OFFICIAL_CATEGORIES.slice(0, 8);

  return (
    <div dir="rtl" className="space-y-6 pb-28 pt-2 max-w-6xl mx-auto px-3 sm:px-4 font-['Cairo',sans-serif]">
      
      {/* 1. إعلان البانر العلوي YR Ads #1 */}
      <AdBanner placementId="1" className="mb-2" />

      {/* 2. بطاقة البانر الترويجي الفاخر (Hero Card) */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0B0F17] border border-[#1F2937] p-6 sm:p-8 shadow-2xl flex flex-col justify-between">
        <div className="space-y-2 max-w-lg z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFC500]/15 border border-[#FFC500]/30 text-[#FFC500] text-xs font-bold">
            <Sparkles size={14} /> دليل اليمن الشامل
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
            اكتشف الأفضل في مدينتك
          </h2>
          <p className="text-xs sm:text-sm text-[#9CA3AF]">
            تقييمات حقيقية من المجتمع الموثق لأفضل الشركات والخدمات والمزادات في اليمن.
          </p>
        </div>

        <div className="pt-4 z-10">
          <button 
            onClick={() => onSelectCategory('all')}
            className="px-6 py-2.5 rounded-xl bg-[#FFC500] text-black font-black text-xs hover:bg-[#FFC500]/90 transition-all shadow-lg shadow-[#FFC500]/20 cursor-pointer flex items-center gap-2"
          >
            <span>استكشف الدليل الآن</span>
            <ArrowRight size={14} className="rtl:rotate-180" />
          </button>
        </div>
      </div>

      {/* 3. شبكة التصنيفات الرئيسية الفاخرة */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black text-white flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FFC500]" /> التصنيفات الرئيسية
          </h3>
          <button 
            onClick={() => setShowAllCategories(!showAllCategories)}
            className="text-xs font-bold text-[#FFC500] flex items-center gap-1 hover:underline"
          >
            <span>{showAllCategories ? 'عرض أقل' : 'عرض الكل'}</span>
            {showAllCategories ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2.5">
          {displayedCategories.map((cat: CategoryItem) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.slug)}
                className="h-20 sm:h-24 rounded-2xl bg-[#0B0F17] border border-[#1F2937] hover:border-[#FFC500]/50 p-2 flex flex-col items-center justify-center gap-1.5 transition-all group shadow-sm active:scale-95 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-[#161D2B] group-hover:bg-[#FFC500] text-[#FFC500] group-hover:text-black flex items-center justify-center transition-all">
                  <Icon size={18} />
                </div>
                <span className="text-[10px] font-bold text-gray-300 group-hover:text-white truncate max-w-full">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. بطاقة أقوى العروض والخصومات (Coupons & Offers Card) */}
      <div className="bg-gradient-to-r from-[#161D2B] via-[#0B0F17] to-[#161D2B] p-4 rounded-2xl border border-[#FFC500]/30 shadow-xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#DC2626]/20 text-[#DC2626] flex items-center justify-center font-black text-xs shrink-0">
            خصم 20%
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-white">عروض متجر العصرية للجوالات</h4>
            <p className="text-[10px] text-[#9CA3AF]">ضمان سنة كاملة + شاحن مجاني لجميع الأجهزة</p>
          </div>
        </div>
        <div className="border border-dashed border-[#FFC500] px-3 py-1.5 rounded-xl text-center shrink-0">
          <span className="text-[9px] text-[#9CA3AF] block">كود الخصم</span>
          <b className="text-xs font-mono text-[#FFC500]">YR20</b>
        </div>
      </div>

      {/* 5. قسم الشركات الأعلى تقييماً (Horizontal Carousel) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black text-white flex items-center gap-1.5">
            <Star size={16} className="text-[#FFC500]" fill="#FFC500" /> الأعلى تقييماً
          </h3>
          <button onClick={() => onSelectCategory('all')} className="text-xs font-bold text-[#FFC500]">عرض الكل</button>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
          {businesses.slice(0, 6).map((b) => (
            <div
              key={b.id}
              onClick={() => onSelectBusiness(b)}
              className="shrink-0 w-44 rounded-2xl bg-[#0B0F17] border border-[#1F2937] hover:border-[#FFC500]/50 overflow-hidden shadow-lg cursor-pointer transition-all active:scale-95"
            >
              <div className="h-24 w-full relative">
                <img src={b.image} alt={b.name} className="w-full h-full object-cover" />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/80 text-[#FFC500] text-[10px] font-black flex items-center gap-0.5">
                  ★ {b.rating}
                </span>
              </div>
              <div className="p-3 space-y-1">
                <h4 className="text-xs font-bold text-white truncate">{b.name}</h4>
                <p className="text-[10px] text-[#9CA3AF] truncate">{b.category} • {b.city}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. قسم المزادات الحية الفاخر (Live Auctions Carousel) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black text-white flex items-center gap-1.5">
            <Gavel size={16} className="text-[#DC2626]" /> المزادات الحية المعتمدة (5% عمولة)
          </h3>
          <button onClick={onNavigateAuctions} className="text-xs font-bold text-[#FFC500]">عرض الكل</button>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
          {[
            { id: '1', title: 'تويوتا لاندكروزر V8 بريمي 2022', price: '182,000 SAR', time: '04:12:30', img: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&auto=format&fit=crop&q=80' },
            { id: '2', title: 'أرض تجارية ركنية شارع الستين', price: '95,000,000 YER', time: '08:45:10', img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format&fit=crop&q=80' },
            { id: '3', title: 'شاحنة مرسيدس أكتروس 2020', price: '58,000 USD', time: '02:30:00', img: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80' }
          ].map(auc => (
            <div 
              key={auc.id} 
              onClick={onNavigateAuctions}
              className="shrink-0 w-64 rounded-2xl bg-[#0B0F17] border border-[#1F2937] overflow-hidden shadow-lg cursor-pointer hover:border-[#FFC500]/50 transition-all"
            >
              <div className="h-32 w-full relative">
                <img src={auc.img} alt={auc.title} className="w-full h-full object-cover" />
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#DC2626] text-white text-[10px] font-black animate-pulse flex items-center gap-1">
                  🔴 جارٍ المزاد
                </span>
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/80 text-white text-[10px] font-mono">
                  ⏳ {auc.time}
                </span>
              </div>
              <div className="p-3 space-y-1">
                <h4 className="text-xs font-bold text-white truncate">{auc.title}</h4>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-[10px] text-[#9CA3AF]">أعلى مزايدة:</span>
                  <b className="text-xs font-mono text-[#16A34A] font-bold">{auc.price}</b>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. إعلان YR Ads الموضع #2 (شريط عريض مستقل بين الأقسام) */}
      <div className="w-full my-4">
        <AdBanner placementId="2" className="w-full shadow-xl" />
      </div>

      {/* 8. حاسبة ومحول الصرف المباشر (Interactive Currency Converter) */}
      <div className="bg-[#0B0F17] rounded-3xl border border-[#1F2937] p-5 sm:p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
          <div className="flex items-center gap-2">
            <Coins size={18} className="text-[#FFC500]" />
            <h3 className="text-sm font-black text-white">الأسعار ومحول الصرف المباشر</h3>
          </div>
          <button onClick={onNavigateExchangeRates} className="text-xs font-bold text-[#FFC500] hover:underline">
            البورصة الكاملة ←
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 space-y-2">
            <label className="text-[11px] text-[#9CA3AF] block font-bold">المبلغ المراد تحويله:</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={calcAmount}
                onChange={(e) => setCalcAmount(Number(e.target.value))}
                className="flex-1 bg-[#161D2B] border border-[#1F2937] rounded-xl p-2.5 text-sm font-bold text-white font-mono outline-none"
              />
              <select
                value={calcCurrency}
                onChange={(e) => setCalcCurrency(e.target.value as any)}
                className="bg-[#161D2B] border border-[#1F2937] rounded-xl p-2.5 text-xs text-white font-bold"
              >
                <option value="USD">دولار ($)</option>
                <option value="SAR">سعودي (SAR)</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-[#161D2B] rounded-2xl border border-[#1F2937] space-y-1.5">
            <span className="text-[10px] text-[#9CA3AF] block">فارق الصرف بين السوقين:</span>
            <div className="text-sm font-black font-mono text-[#FFC500]">
              +{diffTotal.toLocaleString()} YER
            </div>
            <div className="flex justify-between text-[10px] text-gray-300">
              <span>صنعاء: <b className="font-mono text-white">{sanaaTotal.toLocaleString()}</b></span>
              <span>عدن: <b className="font-mono text-[#16A34A]">{adenTotal.toLocaleString()}</b></span>
            </div>
          </div>
        </div>
      </div>

      {/* 9. قسم العقارات المميزة (Featured Properties Carousel) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black text-white flex items-center gap-1.5">
            <Building size={16} className="text-[#3B82F6]" /> العقارات والفرص الاستثمارية
          </h3>
          <button onClick={onNavigateRealEstate} className="text-xs font-bold text-[#FFC500]">عرض الكل</button>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
          {[
            { id: '1', title: 'شقة سوبر ديلوكس مفروشة — حدة', price: '3,500 SAR / شهرياً', specs: '3 غرف • 2 حمام • 150 م²', img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=80' },
            { id: '2', title: 'فيلا مستقلة فاخرة مسبح وحديقة — عدن', price: '450,000 USD', specs: '5 غرف • 4 حمام • 450 م²', img: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&auto=format&fit=crop&q=80' }
          ].map(prop => (
            <div 
              key={prop.id} 
              onClick={onNavigateRealEstate}
              className="shrink-0 w-64 rounded-2xl bg-[#0B0F17] border border-[#1F2937] overflow-hidden shadow-lg cursor-pointer hover:border-[#FFC500]/50 transition-all"
            >
              <div className="h-32 w-full relative">
                <img src={prop.img} alt={prop.title} className="w-full h-full object-cover" />
                <span className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-[#FFC500] text-black text-xs font-black">
                  {prop.price}
                </span>
              </div>
              <div className="p-3 space-y-1">
                <h4 className="text-xs font-bold text-white truncate">{prop.title}</h4>
                <p className="text-[10px] text-[#9CA3AF] truncate">{prop.specs}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
