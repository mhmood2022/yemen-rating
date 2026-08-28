import React from 'react';
import { OFFICIAL_CATEGORIES, CategoryItem } from '../../data/categories';
import { BusinessItem } from '../../data/mockData';
import { VerifiedBadge } from '../common/VerifiedBadge';
import { Star, Sparkles } from 'lucide-react';

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
  const topRated = [...businesses].sort((a, b) => b.rating - a.rating);

  return (
    <div dir="rtl" className="space-y-8">
      
      {/* 1. Official 26 Categories Grid With Subcategories Tags */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2 h-5 bg-amber-400 rounded-sm"></span>
            التصنيفات الرسمية (26 تصنيفاً)
          </h2>
          <span className="text-xs text-zinc-500">اضغط على أي تصنيف للتصفح</span>
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
                <div className="w-9 h-9 rounded-xl bg-zinc-800 group-hover:bg-amber-400 text-zinc-300 group-hover:text-zinc-950 flex items-center justify-center transition-colors mb-2">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="font-bold text-xs sm:text-sm text-zinc-200 group-hover:text-amber-400 transition-colors line-clamp-1">
                  {cat.name}
                </span>

                {/* عرض الفروع الفرعية تحت التصنيف في الرئيسية */}
                {cat.subcategories && cat.subcategories.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap mt-2 pt-2 border-t border-zinc-800/60 w-full">
                    {cat.subcategories.slice(0, 2).map((sub) => (
                      <span
                        key={sub.id}
                        className="text-[10px] text-zinc-400 bg-zinc-950/80 px-1.5 py-0.5 rounded border border-zinc-800/80 truncate max-w-[90px]"
                      >
                        {sub.name}
                      </span>
                    ))}
                    {cat.subcategories.length > 2 && (
                      <span className="text-[10px] text-amber-400 font-mono font-bold">
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

      {/* 2. Featured Businesses Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            منشآت وخدمات موثقة ومميزة
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {businesses.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectBusiness(item)}
              className="bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-amber-400/40 rounded-2xl p-4 flex gap-4 transition-all cursor-pointer group shadow-md"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-zinc-800 overflow-hidden flex-shrink-0">
                <img src={item.logo} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-bold text-xs sm:text-sm text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                      {item.name}
                    </h3>
                    {item.isVerified && (
                      <VerifiedBadge type={item.badgeType} size="sm" />
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1">{item.description}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-xs">
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {item.rating}
                  </span>
                  <span className="text-zinc-500 text-[11px] truncate">{item.address}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Top Rated Businesses */}
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
                <div className="flex items-center gap-1">
                  <h4 className="text-xs font-bold text-white truncate group-hover:text-amber-400">{item.name}</h4>
                  {item.isVerified && (
                    <VerifiedBadge type={item.badgeType} size="sm" />
                  )}
                </div>
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
