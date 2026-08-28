import React from 'react';
import { 
  Star, 
  MapPin, 
  Clock, 
  Gavel, 
  Building, 
  Briefcase, 
  TrendingUp, 
  Sparkles, 
  ArrowLeft,
  Coins,
  DollarSign,
  Utensils,
  Car,
  ShoppingBag,
  HeartPulse,
  Store,
  Layers,
  CheckCircle2
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
  return (
    <div dir="rtl" className="space-y-6 pb-20">
      
      {/* 1. Hero Promo Banner Card (اكتشف الأفضل) */}
      <div className="relative overflow-hidden rounded-2xl bg-[#181818] border border-[#292929] shadow-xl">
        <div className="relative h-44 sm:h-52 w-full">
          <img
            src="https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=1200&auto=format&fit=crop&q=80"
            alt="صنعاء القديمة"
            className="w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-[#181818] via-[#181818]/85 to-transparent" />
          
          <div className="absolute inset-0 p-5 flex flex-col justify-between z-10 max-w-sm">
            <div className="space-y-1.5">
              <h2 className="text-lg sm:text-xl font-extrabold text-white">اكتشف الأفضل</h2>
              <p className="text-xs text-zinc-300 leading-relaxed">
                تقييمات حقيقية من المجتمع لأفضل الشركات والخدمات في اليمن
              </p>
            </div>

            <div>
              <button
                onClick={() => onSelectCategory('restaurants')}
                className="px-5 py-2 bg-[#f5c400] hover:bg-[#e5b800] text-zinc-950 font-bold text-xs rounded-lg transition-transform active:scale-95 shadow-md"
              >
                استكشف الآن
              </button>
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
            <span className="w-4 h-1.5 rounded-full bg-[#f5c400]" />
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
          </div>
        </div>
      </div>

      {/* 2. التصنيفات الرئيسية (Categories Row Cards) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-bold text-white">التصنيفات الرئيسية</h3>
          <button
            onClick={() => onSelectCategory('all')}
            className="text-xs text-[#f5c400] hover:underline font-semibold"
          >
            عرض الكل
          </button>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
          {[
            { name: 'صحة وجمال', slug: 'health', icon: HeartPulse },
            { name: 'متاجر', slug: 'shops', icon: ShoppingBag },
            { name: 'خدمات', slug: 'services', icon: Layers },
            { name: 'سيارات', slug: 'transport', icon: Car },
            { name: 'مطاعم ومقاهي', slug: 'restaurants', icon: Utensils }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => onSelectCategory(item.slug)}
                className="w-20 sm:w-24 h-20 sm:h-24 rounded-2xl bg-[#181818] border border-[#282828] hover:border-[#f5c400]/50 p-2 flex flex-col items-center justify-center gap-2 flex-shrink-0 transition-all group"
              >
                <Icon className="w-6 h-6 text-[#f5c400] group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-medium text-zinc-300 truncate w-full text-center">
                  {item.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. الأعلى تقييماً (Top Rated) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-bold text-white">الأعلى تقييماً</h3>
          <button
            onClick={() => onSelectCategory('restaurants')}
            className="text-xs text-[#f5c400] hover:underline font-semibold"
          >
            عرض الكل
          </button>
        </div>

        <div className="flex items-center gap-3.5 overflow-x-auto pb-1 scrollbar-none">
          {businesses.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectBusiness(item)}
              className="w-44 sm:w-48 rounded-2xl bg-[#181818] border border-[#282828] overflow-hidden flex-shrink-0 cursor-pointer group hover:border-[#f5c400]/40 transition-all shadow-lg"
            >
              <div className="relative h-28 w-full bg-[#222]">
                <img
                  src={item.coverImage}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 bg-zinc-950/90 backdrop-blur-md px-2 py-0.5 rounded-lg border border-zinc-800 text-[11px] font-bold text-[#f5c400] flex items-center gap-1">
                  <Star className="w-3 h-3 fill-[#f5c400]" />
                  <span>{item.rating}</span>
                </div>
              </div>

              <div className="p-3 space-y-1">
                <div className="flex items-center gap-1">
                  <h4 className="font-bold text-xs text-white truncate group-hover:text-[#f5c400]">{item.name}</h4>
                  {item.isVerified && <VerifiedBadge type={item.badgeType} size="sm" />}
                </div>
                <p className="text-[10px] text-zinc-400 truncate">{item.categorySlug}</p>
                <p className="text-[10px] text-zinc-500 flex items-center gap-1 pt-0.5">
                  <MapPin className="w-3 h-3 text-zinc-400" />
                  <span>{item.address}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. المزادات الحية (المزاد بدل الترند) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
            <Gavel className="w-4 h-4 text-[#f5c400]" />
            <span>المزادات الحية</span>
          </h3>
          <button
            onClick={onNavigateAuctions}
            className="text-xs text-[#f5c400] hover:underline font-semibold"
          >
            عرض الكل
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div
            onClick={onNavigateAuctions}
            className="rounded-2xl bg-[#181818] border border-[#282828] p-3 flex gap-3 cursor-pointer group hover:border-[#f5c400]/40 transition-all shadow-md"
          >
            <div className="w-20 h-20 rounded-xl bg-[#222] overflow-hidden flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400&auto=format&fit=crop&q=80"
                alt="مزاد سيارة"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="flex-1 flex flex-col justify-between min-w-0">
              <div>
                <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.2 rounded font-bold">مباشر</span>
                <h4 className="font-bold text-xs text-white truncate mt-1 group-hover:text-[#f5c400]">تويوتا لاندكروزر V8 2022</h4>
                <p className="text-[10px] text-zinc-400 font-mono">أعلى مزايدة: 48,500 $</p>
              </div>
              <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1 border-t border-zinc-800">
                <span className="flex items-center gap-1 text-[#f5c400]"><Clock className="w-3 h-3" /> 04:18:22</span>
                <span className="text-[#f5c400] font-bold">دخول المزاد ←</span>
              </div>
            </div>
          </div>

          <div
            onClick={onNavigateAuctions}
            className="rounded-2xl bg-[#181818] border border-[#282828] p-3 flex gap-3 cursor-pointer group hover:border-[#f5c400]/40 transition-all shadow-md"
          >
            <div className="w-20 h-20 rounded-xl bg-[#222] overflow-hidden flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&auto=format&fit=crop&q=80"
                alt="مزاد عقار"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="flex-1 flex flex-col justify-between min-w-0">
              <div>
                <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.2 rounded font-bold">مباشر</span>
                <h4 className="font-bold text-xs text-white truncate mt-1 group-hover:text-[#f5c400]">أرض تجارية 6 لبن شارع الستين</h4>
                <p className="text-[10px] text-zinc-400 font-mono">أعلى مزايدة: 185M YER</p>
              </div>
              <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1 border-t border-zinc-800">
                <span className="flex items-center gap-1 text-[#f5c400]"><Clock className="w-3 h-3" /> 01:12:45</span>
                <span className="text-[#f5c400] font-bold">دخول المزاد ←</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. العقارات المميزة (Real Estate Spotlight) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
            <Building className="w-4 h-4 text-[#f5c400]" />
            <span>العقارات المميزة</span>
          </h3>
          <button
            onClick={onNavigateRealEstate}
            className="text-xs text-[#f5c400] hover:underline font-semibold"
          >
            عرض الكل
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div
            onClick={onNavigateRealEstate}
            className="p-3 rounded-2xl bg-[#181818] border border-[#282828] flex items-center gap-3 cursor-pointer group hover:border-[#f5c400]/40 transition-all shadow-md"
          >
            <div className="w-16 h-16 rounded-xl bg-[#222] overflow-hidden flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&auto=format&fit=crop&q=80"
                alt="عقار للإيجار"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-blue-400 bg-blue-500/10 px-1.5 py-0.2 rounded font-semibold">للإيجار</span>
                <span className="text-xs font-bold text-[#f5c400] font-mono">400 $/شهر</span>
              </div>
              <h4 className="text-xs font-bold text-white truncate mt-1 group-hover:text-[#f5c400]">شقة سوبر ديلوكس حدة</h4>
              <p className="text-[10px] text-zinc-500">3 غرف · 2 حمام · 160 م²</p>
            </div>
          </div>

          <div
            onClick={onNavigateRealEstate}
            className="p-3 rounded-2xl bg-[#181818] border border-[#282828] flex items-center gap-3 cursor-pointer group hover:border-[#f5c400]/40 transition-all shadow-md"
          >
            <div className="w-16 h-16 rounded-xl bg-[#222] overflow-hidden flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&auto=format&fit=crop&q=80"
                alt="فيلا للبيع"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded font-semibold">للبيع</span>
                <span className="text-xs font-bold text-[#f5c400] font-mono">280,000 $</span>
              </div>
              <h4 className="text-xs font-bold text-white truncate mt-1 group-hover:text-[#f5c400]">فيلا مستقلة مودرن إنماء عدن</h4>
              <p className="text-[10px] text-zinc-500">5 غرف · مسبح · 450 م²</p>
            </div>
          </div>
        </div>
      </div>

      {/* 6. أحدث الوظائف (Jobs Spotlight) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-[#f5c400]" />
            <span>أحدث الوظائف</span>
          </h3>
          <button
            onClick={onNavigateJobs}
            className="text-xs text-[#f5c400] hover:underline font-semibold"
          >
            عرض الكل
          </button>
        </div>

        <div className="space-y-2.5">
          <div
            onClick={onNavigateJobs}
            className="p-3.5 rounded-2xl bg-[#181818] border border-[#282828] hover:border-[#f5c400]/40 transition-all flex items-center justify-between cursor-pointer group shadow-sm"
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
            className="p-3.5 rounded-2xl bg-[#181818] border border-[#282828] hover:border-[#f5c400]/40 transition-all flex items-center justify-between cursor-pointer group shadow-sm"
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

      {/* 7. أسعار العملات والذهب (Exchange Rates) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-[#f5c400]" />
            <span>أسعار العملات والذهب</span>
          </h3>
          <button
            onClick={onNavigateExchangeRates}
            className="text-xs text-[#f5c400] hover:underline font-semibold"
          >
            عرض الكل
          </button>
        </div>

        <div className="rounded-2xl bg-[#181818] border border-[#282828] p-3.5 space-y-3 shadow-lg">
          <div className="grid grid-cols-3 gap-2 text-center">
            
            {/* ريال سعودي */}
            <div className="bg-[#121212] p-2.5 rounded-xl border border-[#222]">
              <span className="text-[11px] font-bold text-white block mb-1">ريال سعودي</span>
              <div className="flex justify-around text-[10px] text-zinc-400">
                <span>شراء: <strong className="text-[#f5c400] font-mono">140.2</strong></span>
                <span>بيع: <strong className="text-white font-mono">140.8</strong></span>
              </div>
              <span className="text-[9px] text-zinc-500 mt-1 block font-mono">ريال يمني</span>
            </div>

            {/* دولار أمريكي */}
            <div className="bg-[#121212] p-2.5 rounded-xl border border-[#222]">
              <span className="text-[11px] font-bold text-white block mb-1">دولار أمريكي</span>
              <div className="flex justify-around text-[10px] text-zinc-400">
                <span>شراء: <strong className="text-[#f5c400] font-mono">535</strong></span>
                <span>بيع: <strong className="text-white font-mono">538</strong></span>
              </div>
              <span className="text-[9px] text-zinc-500 mt-1 block font-mono">ريال يمني</span>
            </div>

            {/* الذهب عيار 21 */}
            <div className="bg-[#121212] p-2.5 rounded-xl border border-[#222]">
              <span className="text-[11px] font-bold text-white block mb-1">الذهب عيار 21</span>
              <div className="flex justify-around text-[10px] text-zinc-400">
                <span>شراء: <strong className="text-[#f5c400] font-mono">37,200</strong></span>
              </div>
              <span className="text-[9px] text-zinc-500 mt-1 block font-mono">ريال / جرام</span>
            </div>

          </div>

          <div className="text-center text-[10px] text-zinc-500 pt-1 border-t border-[#222]">
            آخر تحديث: منذ 5 دقائق
          </div>
        </div>
      </div>

      {/* 8. آخر التقييمات (Latest Reviews) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-bold text-white">آخر التقييمات</h3>
          <span className="text-xs text-zinc-500">آراء حقيقية</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#181818] border border-[#282828] flex items-start gap-3 shadow-md">
          <div className="w-16 h-16 rounded-xl bg-[#222] overflow-hidden flex-shrink-0">
            <img
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&auto=format&fit=crop&q=80"
              alt="مطعم رويال ستار"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">أبو محمد</span>
              <span className="text-[10px] text-zinc-500">منذ ساعتين</span>
            </div>
            <p className="text-xs text-zinc-300 line-clamp-1">تجربة رائعة وجودة ممتازة وتعامل راقي جداً.</p>
            <div className="text-[#f5c400] text-xs">★★★★★</div>
          </div>
        </div>
      </div>

    </div>
  );
};
