import React, { useState } from 'react';
import { 
  Star, MapPin, Gavel, Building, Briefcase, 
  Sparkles, ChevronDown, ChevronUp, Coins, ArrowRight, Flame
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
    <div dir="rtl" className="space-y-5 pb-28 pt-1 max-w-6xl mx-auto px-3 sm:px-4 font-['Cairo',sans-serif] text-white">
      
      {/* 1. إعلان البانر العلوي YR Ads #1 */}
      <AdBanner placementId="1" className="mb-1" />

      {/* 2. بطاقة البانر الترويجي الفاخر (Hero Card — أسود فاخر بدون كحلي) */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0F0F12] border border-[#222226] p-5 sm:p-7 shadow-2xl flex flex-col justify-between">
        <div className="space-y-1.5 max-w-lg z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFC500]/15 border border-[#FFC500]/30 text-[#FFC500] text-[11px] font-bold">
            <Sparkles size={13} /> دليل اليمن الشامل
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
            اكتشف الأفضل في مدينتك
          </h2>
          <p className="text-xs text-[#9CA3AF]">
            تقييمات حقيقية من المجتمع لأفضل الشركات والخدمات والمزادات في اليمن.
          </p>
        </div>

        <div className="pt-3 z-10 flex items-center justify-between">
          <button 
            onClick={() => onSelectCategory('all')}
            className="px-5 py-2 rounded-xl bg-[#FFC500] text-black font-black text-xs hover:bg-[#FFC500]/90 transition-all shadow-lg shadow-[#FFC500]/15 cursor-pointer flex items-center gap-1.5"
          >
            <span>استكشف الدليل الآن</span>
            <ArrowRight size={13} className="rtl:rotate-180" />
          </button>

          {/* مؤشرات السلايدر الصغيرة المطابقة للصورة الأولى */}
          <div className="flex gap-1 items-center">
            <span className="w-4 h-1 rounded-full bg-[#FFC500]" />
            <span className="w-1.5 h-1 rounded-full bg-[#333338]" />
            <span className="w-1.5 h-1 rounded-full bg-[#333338]" />
          </div>
        </div>
      </div>

      {/* 3. شبكة التصنيفات الرئيسية الفاخرة بالأسود والذهبي */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-white flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FFC500]" /> التصنيفات الرئيسية
          </h3>
          <button 
            onClick={() => setShowAllCategories(!showAllCategories)}
            className="text-xs font-bold text-[#FFC500] flex items-center gap-1 hover:underline"
          >
            <span>{showAllCategories ? 'عرض أقل' : 'عرض الكل'}</span>
            {showAllCategories ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
          {displayedCategories.map((cat: CategoryItem) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.slug)}
                className="h-20 sm:h-22 rounded-2xl bg-[#0F0F12] border border-[#222226] hover:border-[#FFC500]/50 p-2 flex flex-col items-center justify-center gap-1.5 transition-all group active:scale-95 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-[#1A1A1E] group-hover:bg-[#FFC500] text-[#FFC500] group-hover:text-black flex items-center justify-center transition-all">
                  <Icon size={17} />
                </div>
                <span className="text-[10px] font-bold text-[#D1D5DB] group-hover:text-white truncate max-w-full">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. بطاقة أقوى العروض والخصومات (Coupons & Offers Card) */}
      <div className="bg-[#0F0F12] p-3.5 rounded-2xl border border-[#222226] shadow-lg flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="px-2.5 py-1 rounded-xl bg-[#DC2626]/20 text-[#DC2626] border border-[#DC2626]/30 font-black text-[11px] shrink-0">
            خصم 20%
          </div>
          <div>
            <h4 className="text-xs font-black text-white">عروض متجر العصرية للجوالات</h4>
            <p className="text-[10px] text-[#9CA3AF]">ضمان سنة كاملة + شاحن مجاني</p>
          </div>
        </div>
        <div className="border border-dashed border-[#FFC500]/60 bg-[#161619] px-3 py-1 rounded-xl text-center shrink-0">
          <span className="text-[8px] text-[#9CA3AF] block">كود الخصم</span>
          <b className="text-xs font-mono text-[#FFC500]">YR20</b>
        </div>
      </div>

      {/* 5. قسم الشركات الأعلى تقييماً (الأفقي المودرن) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-white flex items-center gap-1.5">
            <Star size={14} className="text-[#FFC500]" fill="#FFC500" /> الأعلى تقييماً
          </h3>
          <button onClick={() => onSelectCategory('all')} className="text-xs font-bold text-[#FFC500]">عرض الكل</button>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-1 custom-scrollbar">
          {businesses.slice(0, 6).map((b) => (
            <div
              key={b.id}
              onClick={() => onSelectBusiness(b)}
              className="shrink-0 w-44 rounded-2xl bg-[#0F0F12] border border-[#222226] hover:border-[#FFC500]/50 overflow-hidden shadow-md cursor-pointer transition-all active:scale-95"
            >
              <div className="h-24 w-full relative">
                <img src={b.image} alt={b.name} className="w-full h-full object-cover" />
                <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/85 text-[#FFC500] text-[10px] font-black flex items-center gap-0.5">
                  ★ {b.rating}
                </span>
              </div>
              <div className="p-2.5 space-y-0.5">
                <h4 className="text-xs font-bold text-white truncate">{b.name}</h4>
                <p className="text-[10px] text-[#9CA3AF] truncate">{b.category} • {b.city}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. قسم الترند الآن 🔥 */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-white flex items-center gap-1.5">
            <Flame size={14} className="text-orange-500" /> الترند الآن
          </h3>
          <button onClick={() => onSelectCategory('all')} className="text-xs font-bold text-[#FFC500]">عرض الكل</button>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-1 custom-scrollbar">
          {[
            { id: '1', title: 'مطعم البيت اليمني', cat: 'مطاعم ومقاهي', views: 125, img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80' },
            { id: '2', title: 'متجر العصرية للإلكترونيات', cat: 'متاجر وهواتف', views: 98, img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=80' },
            { id: '3', title: 'مركز النخبة الطبي', cat: 'مستشفيات وصحة', views: 76, img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=500&auto=format&fit=crop&q=80' }
          ].map(tr => (
            <div 
              key={tr.id}
              className="shrink-0 w-44 rounded-2xl bg-[#0F0F12] border border-[#222226] overflow-hidden shadow-md cursor-pointer hover:border-[#FFC500]/50 transition-all"
            >
              <div className="h-24 w-full relative">
                <img src={tr.img} alt={tr.title} className="w-full h-full object-cover" />
                <span className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-md bg-black/85 text-orange-400 text-[10px] font-black flex items-center gap-1">
                  🔥 {tr.views}
                </span>
              </div>
              <div className="p-2.5 space-y-0.5">
                <h4 className="text-xs font-bold text-white truncate">{tr.title}</h4>
                <p className="text-[10px] text-[#9CA3AF] truncate">{tr.cat}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. المزادات الحية (صور سيارات ومعدات حقيقية) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-white flex items-center gap-1.5">
            <Gavel size={14} className="text-[#DC2626]" /> المزادات الحية المعتمدة (5% عمولة)
          </h3>
          <button onClick={onNavigateAuctions} className="text-xs font-bold text-[#FFC500]">عرض الكل</button>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-1 custom-scrollbar">
          {[
            { id: '1', title: 'تويوتا لاندكروزر V8 بريمي 2022', price: '182,000 SAR', time: '04:12:30', img: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&auto=format&fit=crop&q=80' },
            { id: '2', title: 'أرض تجارية ركنية شارع الستين', price: '95,000,000 YER', time: '08:45:10', img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format&fit=crop&q=80' },
            { id: '3', title: 'شاحنة مرسيدس أكتروس 2020', price: '58,000 USD', time: '02:30:00', img: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&auto=format&fit=crop&q=80' }
          ].map(auc => (
            <div 
              key={auc.id} 
              onClick={onNavigateAuctions}
              className="shrink-0 w-60 rounded-2xl bg-[#0F0F12] border border-[#222226] overflow-hidden shadow-lg cursor-pointer hover:border-[#FFC500]/50 transition-all"
            >
              <div className="h-32 w-full relative">
                <img src={auc.img} alt={auc.title} className="w-full h-full object-cover" />
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#DC2626] text-white text-[9px] font-black animate-pulse">
                  🔴 جارٍ المزاد
                </span>
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/85 text-white text-[10px] font-mono">
                  ⏳ {auc.time}
                </span>
              </div>
              <div className="p-3 space-y-0.5">
                <h4 className="text-xs font-bold text-white truncate">{auc.title}</h4>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-[10px] text-[#9CA3AF]">أعلى مزايدة:</span>
                  <b className="text-xs font-mono text-[#16A34A]">{auc.price}</b>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 8. إعلان YR Ads الموضع #2 (شريط عريض مستقل في المنتصف) */}
      <div className="w-full my-3">
        <AdBanner placementId="2" className="w-full" />
      </div>

      {/* 9. حاسبة ومحول الصرف المباشر (أسود فاخر بدون كحلي) */}
      <div className="bg-[#0F0F12] rounded-3xl border border-[#222226] p-4 sm:p-6 space-y-3 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#222226] pb-2.5">
          <div className="flex items-center gap-1.5">
            <Coins size={16} className="text-[#FFC500]" />
            <h3 className="text-xs sm:text-sm font-black text-white">الأسعار ومحول الصرف المباشر</h3>
          </div>
          <button onClick={onNavigateExchangeRates} className="text-xs font-bold text-[#FFC500] hover:underline">
            البورصة الكاملة ←
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-[10px] text-[#9CA3AF] block font-bold">المبلغ المراد تحويله:</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={calcAmount}
                onChange={(e) => setCalcAmount(Number(e.target.value))}
                className="flex-1 bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-sm font-bold text-white font-mono outline-none"
              />
              <select
                value={calcCurrency}
                onChange={(e) => setCalcCurrency(e.target.value as any)}
                className="bg-[#18181C] border border-[#27272A] rounded-xl p-2 text-xs text-white font-bold"
              >
                <option value="USD">دولار ($)</option>
                <option value="SAR">سعودي (SAR)</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-[#18181C] rounded-2xl border border-[#27272A] space-y-1">
            <span className="text-[9px] text-[#9CA3AF] block">فارق الصرف بين السوقين:</span>
            <div className="text-sm font-black font-mono text-[#FFC500]">
              +{diffTotal.toLocaleString()} YER
            </div>
            <div className="flex justify-between text-[9px] text-gray-300">
              <span>صنعاء: <b className="font-mono text-white">{sanaaTotal.toLocaleString()}</b></span>
              <span>عدن: <b className="font-mono text-[#16A34A]">{adenTotal.toLocaleString()}</b></span>
            </div>
          </div>
        </div>
      </div>

      {/* 10. قسم العقارات المميزة */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-white flex items-center gap-1.5">
            <Building size={14} className="text-[#3B82F6]" /> العقارات والفرص الاستثمارية
          </h3>
          <button onClick={onNavigateRealEstate} className="text-xs font-bold text-[#FFC500]">عرض الكل</button>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-1 custom-scrollbar">
          {[
            { id: '1', title: 'شقة سوبر ديلوكس مفروشة — حدة', price: '3,500 SAR / شهر', specs: '3 غرف • 2 حمام • 150 م²', img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=80' },
            { id: '2', title: 'فيلا مستقلة فاخرة مسبح وحديقة — عدن', price: '450,000 USD', specs: '5 غرف • 4 حمام • 450 م²', img: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&auto=format&fit=crop&q=80' }
          ].map(prop => (
            <div 
              key={prop.id} 
              onClick={onNavigateRealEstate}
              className="shrink-0 w-60 rounded-2xl bg-[#0F0F12] border border-[#222226] overflow-hidden shadow-lg cursor-pointer hover:border-[#FFC500]/50 transition-all"
            >
              <div className="h-32 w-full relative">
                <img src={prop.img} alt={prop.title} className="w-full h-full object-cover" />
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-lg bg-[#FFC500] text-black text-[11px] font-black">
                  {prop.price}
                </span>
              </div>
              <div className="p-3 space-y-0.5">
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
