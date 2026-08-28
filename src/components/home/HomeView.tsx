import React from 'react';
import { OFFICIAL_CATEGORIES, CategoryItem } from '../../data/categories';
import { BusinessItem, SAMPLE_ADS } from '../../data/mockData';
import { AdBanner } from '../common/AdBanner';
import { Star, MapPin, CheckCircle2, TrendingUp, Sparkles, Building, Briefcase, Gavel, Layers } from 'lucide-react';

interface HomeViewProps {
  onSelectCategory: (slug: string) => void;
  onSelectBusiness: (business: BusinessItem) => void;
  businesses: BusinessItem[];
}

export const HomeView: React.FC<HomeViewProps> = ({
  onSelectCategory,
  onSelectBusiness,
  businesses
}) => {
  const featuredBusinesses = businesses.filter(b => b.isFeatured);
  const topRated = [...businesses].sort((a, b) => b.rating - a.rating);

  return (
    <div dir="rtl" className="space-y-8">
      
      {/* 1. Hero Ad / Spotlight */}
      <AdBanner ad={SAMPLE_ADS[0]} type="hero" />

      {/* 2. Official 26 Categories Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2 h-5 bg-amber-400 rounded-sm"></span>
            التصنيفات الرسمية (26 تصنيفاً)
          </h2>
          <span className="text-xs text-zinc-500">اختر التصنيف للتصفح الفوري</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4">
          {OFFICIAL_CATEGORIES.map((cat: CategoryItem) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.slug)}
                className="flex flex-col items-start p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-amber-400/50 hover:bg-zinc-900 transition-all group text-right shadow-sm"
              >
                <div className="w-9 h-9 rounded-xl bg-zinc-800 group-hover:bg-amber-400 text-zinc-300 group-hover:text-zinc-950 flex items-center justify-center transition-colors mb-2.5">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="font-semibold text-xs sm:text-sm text-zinc-200 group-hover:text-amber-400 transition-colors line-clamp-1">
                  {cat.name}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono mt-0.5">
                  {cat.slug}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Featured Businesses Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            منشآت وخدمات مميزة وموثقة
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {featuredBusinesses.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectBusiness(item)}
              className="bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-amber-400/40 rounded-2xl p-4 flex gap-4 transition-all cursor-pointer group shadow-md"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-zinc-800 overflow-hidden flex-shrink-0">
                <img src={item.logo} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-xs sm:text-sm text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                      {item.name}
                    </h3>
                    {item.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1">{item.description}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-xs">
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {item.rating}
                  </span>
                  <span className="text-zinc-500 text-[11px]">{item.address}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Secondary In-Feed Ad */}
      <AdBanner ad={SAMPLE_ADS[1]} type="in-feed" />

      {/* 5. Top Rated Businesses */}
      <div className="space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-400" />
          الأعلى تقييماً في اليمن
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {topRated.slice(0, 3).map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectBusiness(item)}
              className="bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5 flex items-center gap-3 cursor-pointer transition-all group"
            >
              <div className="w-12 h-12 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0">
                <img src={item.logo} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-white truncate group-hover:text-amber-400">{item.name}</h4>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-400">
                  <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                    <Star className="w-3 h-3 fill-amber-400" />
                    {item.rating}
                  </span>
                  <span>({item.reviewsCount} تقييم)</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
