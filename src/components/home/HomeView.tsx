import React, { useState } from 'react';
import { 
  Star, MapPin, Gavel, Building, Briefcase, 
  Sparkles, ChevronDown, ChevronUp, Coins, ArrowRight, Smartphone
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
    <div dir="rtl" className="space-y-4 pb-28 pt-1 max-w-6xl mx-auto px-3 sm:px-4 font-['Cairo',sans-serif] text-white">
      
      {/* 1. إعلان البانر العلوي YR Ads #1 */}
      <AdBanner placementId="1" className="mb-1" />

      {/* 2. بطاقة البانر الترويجي الفاخر (Hero Card — أنيق ومضغوط) */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0F0F12] border border-[#222226] p-4 sm:p-6 shadow-xl flex flex-col justify-between">
        <div className="space-y-1 max-w-lg z-10">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#FFC500]/15 border border-[#FFC500]/30 text-[#FFC500] text-[10px] font-bold">
            <Sparkles size={12} /> دليل اليمن الشامل
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
            اكتشف أفضل الأنشطة والخدمات في مدينتك
          </h2>
          <p className="text-[11px] text-[#9CA3AF]">
            تقييمات حقيقية من المجتمع لأفضل الشركات والخدمات والمزادات المعتمدة.
          </p>
        </div>

        <div className="pt-3 z-10 flex items-center justify-between">
          <button 
            onClick={() => onSelectCategory('all')}
            className="px-4 py-1.5 rounded-xl bg-[#FFC500] text-black font-black text-[11px] hover:bg-[#FFC500]/90 transition-all shadow-md shadow-[#FFC500]/15 cursor-pointer flex items-center gap-1.5"
          >
            <span>استكشف الدليل الآن</span>
            <ArrowRight size={12} className="rtl:rotate-180" />
          </button>

          <div className="flex gap-1 items-center">
            <span className="w-3.5 h-1 rounded-full bg-[#FFC500]" />
            <span className="w-1 h-1 rounded-full bg-[#333338]" />
            <span className="w-1 h-1 rounded-full bg-[#333338]" />
          </div>
        </div>
      </div>

      {/* 3. شبكة التصنيفات الرئيسية الفاخرة */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-white flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFC500]" /> التصنيفات الرئيسية
          </h3>
          <button 
            onClick={() => setShowAllCategories(!showAllCategories)}
            className="text-[11px] font-bold text-[#FFC500] flex items-center gap-1 hover:underline"
          >
            <span>{showAllCategories ? 'عرض أقل' : 'عرض الكل'}</span>
            {showAllCategories ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
          {displayedCategories.map((cat: CategoryItem) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.slug)}
                className="h-18 rounded-2xl bg-[#0F0F12] border border-[#222226] hover:border-[#FFC500]/50 p-1.5 flex flex-col items-center justify-center gap-1 transition-all group active:scale-95 cursor-pointer shadow-sm"
              >
                <div className="w-7 h-7 rounded-xl bg-[#1A1A1E] group-hover:bg-[#FFC500] text-[#FFC500] group-hover:text-black flex items-center justify-center transition-all">
                  <Icon size={15} />
                </div>
                <span className="text-[9.5px] font-bold text-[#D1D5DB] group-hover:text-white truncate max-w-full">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. بطاقة العروض والخصومات */}
      <div className="bg-[#0F0F12] p-3 rounded-2xl border border-[#222226] shadow-md flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="px-2 py-0.5 rounded-lg bg-[#DC2626]/20 text-[#DC2626] border border-[#DC2626]/30 font-black text-[10px] shrink-0">
            خصم 20%
          </div>
          <div>
            <h4 className="text-xs font-black text-white">عروض متجر العصرية للجوالات</h4>
            <p className="text-[9.5px] text-[#9CA3AF]">ضمان سنة كاملة + شاحن مجاني</p>
          </div>
        </div>
        <div className="border border-dashed border-[#FFC500]/60 bg-[#161619] px-2.5 py-0.5 rounded-xl text-center shrink-0">
          <span className="text-[7.5px] text-[#9CA3AF] block">كود الخصم</span>
          <b className="text-[11px] font-mono text-[#FFC500]">YR20</b>
        </div>
      </div>

      {/* 5. الشركات الأعلى تقييماً (كروت رشيقة ومصغرة بدون شريط أبيض) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-white flex items-center gap-1.5">
            <Star size={13} className="text-[#FFC500]" fill="#FFC500" /> الشركات الأعلى تقييماً
          </h3>
          <button onClick={() => onSelectCategory('all')} className="text-[11px] font-bold text-[#FFC500]">عرض الكل</button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {businesses.slice(0, 6).map((b) => (
            <div
              key={b.id}
              onClick={() => onSelectBusiness(b)}
              className="shrink-0 w-36 rounded-xl bg-[#0F0F12] border border-[#222226] hover:border-[#FFC500]/50 overflow-hidden shadow-sm cursor-pointer transition-all active:scale-95"
            >
              <div className="h-20 w-full relative">
                <img src={b.image} alt={b.name} className="w-full h-full object-cover" />
                <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/85 text-[#FFC500] text-[9px] font-black flex items-center gap-0.5">
                  ★ {b.rating}
                </span>
              </div>
              <div className="p-2 space-y-0.5">
                <h4 className="text-[11px] font-bold text-white truncate">{b.name}</h4>
                <p className="text-[9px] text-[#9CA3AF] truncate">{b.category} • {b.city}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. المزادات الحية (كروت مصغرة ومرتبة) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-white flex items-center gap-1.5">
            <Gavel size={13} className="text-[#DC2626]" /> المزادات الحية المعتمدة
          </h3>
          <button onClick={onNavigateAuctions} className="text-[11px] font-bold text-[#FFC500]">عرض الكل</button>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: '1', title: 'تويوتا لاندكروزر V8 بريمي 2022', price: '182,000 SAR', time: '04:12:30', img: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500&auto=format&fit=crop&q=80' },
            { id: '2', title: 'أرض تجارية ركنية شارع الستين', price: '95,000,000 YER', time: '08:45:10', img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500&auto=format&fit=crop&q=80' },
            { id: '3', title: 'شاحنة مرسيدس أكتروس 2020', price: '58,000 USD', time: '02:30:00', img: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=500&auto=format&fit=crop&q=80' }
          ].map(auc => (
            <div 
              key={auc.id} 
              onClick={onNavigateAuctions}
              className="shrink-0 w-48 rounded-xl bg-[#0F0F12] border border-[#222226] overflow-hidden shadow-sm cursor-pointer hover:border-[#FFC500]/50 transition-all"
            >
              <div className="h-24 w-full relative">
                <img src={auc.img} alt={auc.title} className="w-full h-full object-cover" />
                <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-[#DC2626] text-white text-[8px] font-black">
                  🔴 جارٍ المزاد
                </span>
                <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/85 text-white text-[9px] font-mono">
                  ⏳ {auc.time}
                </span>
              </div>
              <div className="p-2 space-y-0.5">
                <h4 className="text-[11px] font-bold text-white truncate">{auc.title}</h4>
                <div className="flex justify-between items-center pt-0.5">
                  <span className="text-[9px] text-[#9CA3AF]">أعلى مزايدة:</span>
                  <b className="text-[11px] font-mono text-[#16A34A]">{auc.price}</b>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. إعلان YR Ads الموضع #2 (شريط عريض مستقل في المنتصف) */}
      <div className="w-full my-2">
        <AdBanner placementId="2" className="w-full" />
      </div>

      {/* 8. حاسبة ومحول الصرف المباشر (أسود فاخر ومضغوط) */}
      <div className="bg-[#0F0F12] rounded-2xl border border-[#222226] p-3.5 sm:p-5 space-y-2.5 shadow-lg">
        <div className="flex items-center justify-between border-b border-[#222226] pb-2">
          <div className="flex items-center gap-1.5">
            <Coins size={14} className="text-[#FFC500]" />
            <h3 className="text-xs font-black text-white">الأسعار ومحول الصرف المباشر</h3>
          </div>
          <button onClick={onNavigateExchangeRates} className="text-[10px] font-bold text-[#FFC500] hover:underline">
            البورصة الكاملة ←
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="sm:col-span-2 space-y-1">
            <label className="text-[9.5px] text-[#9CA3AF] block font-bold">المبلغ المراد تحويله:</label>
            <div className="flex gap-1.5">
              <input
                type="number"
                value={calcAmount}
                onChange={(e) => setCalcAmount(Number(e.target.value))}
                className="flex-1 bg-[#18181C] border border-[#27272A] rounded-xl p-1.5 text-xs font-bold text-white font-mono outline-none"
              />
              <select
                value={calcCurrency}
                onChange={(e) => setCalcCurrency(e.target.value as any)}
                className="bg-[#18181C] border border-[#27272A] rounded-xl p-1.5 text-[11px] text-white font-bold"
              >
                <option value="USD">دولار ($)</option>
                <option value="SAR">سعودي (SAR)</option>
              </select>
            </div>
          </div>

          <div className="p-2 bg-[#18181C] rounded-xl border border-[#27272A] space-y-0.5">
            <span className="text-[8.5px] text-[#9CA3AF] block">فارق الصرف بين السوقين:</span>
            <div className="text-xs font-black font-mono text-[#FFC500]">
              +{diffTotal.toLocaleString()} YER
            </div>
            <div className="flex justify-between text-[8.5px] text-gray-300">
              <span>صنعاء: <b className="font-mono text-white">{sanaaTotal.toLocaleString()}</b></span>
              <span>عدن: <b className="font-mono text-[#16A34A]">{adenTotal.toLocaleString()}</b></span>
            </div>
          </div>
        </div>
      </div>

      {/* 9. قسم العقارات المميزة (كروت رشيقة ومصغرة) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-white flex items-center gap-1.5">
            <Building size={13} className="text-[#3B82F6]" /> العقارات والفرص الاستثمارية
          </h3>
          <button onClick={onNavigateRealEstate} className="text-[11px] font-bold text-[#FFC500]">عرض الكل</button>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: '1', title: 'شقة سوبر ديلوكس مفروشة — حدة', price: '3,500 SAR / شهر', specs: '3 غرف • 2 حمام • 150 م²', img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&auto=format&fit=crop&q=80' },
            { id: '2', title: 'فيلا مستقلة فاخرة مسبح وحديقة — عدن', price: '450,000 USD', specs: '5 غرف • 4 حمام • 450 م²', img: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=500&auto=format&fit=crop&q=80' }
          ].map(prop => (
            <div 
              key={prop.id} 
              onClick={onNavigateRealEstate}
              className="shrink-0 w-48 rounded-xl bg-[#0F0F12] border border-[#222226] overflow-hidden shadow-sm cursor-pointer hover:border-[#FFC500]/50 transition-all"
            >
              <div className="h-24 w-full relative">
                <img src={prop.img} alt={prop.title} className="w-full h-full object-cover" />
                <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-[#FFC500] text-black text-[9px] font-black">
                  {prop.price}
                </span>
              </div>
              <div className="p-2 space-y-0.5">
                <h4 className="text-[11px] font-bold text-white truncate">{prop.title}</h4>
                <p className="text-[9px] text-[#9CA3AF] truncate">{prop.specs}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
