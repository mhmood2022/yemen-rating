import React, { useState } from 'react';
import { ALL_OFFICIAL_CATEGORIES } from '../../data/demoHome';
import {
  Utensils,
  Store,
  Smartphone,
  Car,
  Sparkles,
  HeartPulse,
  Building2,
  Landmark,
  Wallet,
  Coins,
  Hotel,
  Home,
  Truck,
  Laptop,
  GraduationCap,
  Radio,
  ArrowLeft,
  ChevronDown,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const iconMap: Record<string, React.ReactNode> = {
  Utensils: <Utensils size={18} strokeWidth={1.75} />,
  Store: <Store size={18} strokeWidth={1.75} />,
  Smartphone: <Smartphone size={18} strokeWidth={1.75} />,
  Car: <Car size={18} strokeWidth={1.75} />,
  Sparkles: <Sparkles size={18} strokeWidth={1.75} />,
  HeartPulse: <HeartPulse size={18} strokeWidth={1.75} />,
  Building2: <Building2 size={18} strokeWidth={1.75} />,
  Landmark: <Landmark size={18} strokeWidth={1.75} />,
  Wallet: <Wallet size={18} strokeWidth={1.75} />,
  Coins: <Coins size={18} strokeWidth={1.75} />,
  Hotel: <Hotel size={18} strokeWidth={1.75} />,
  Home: <Home size={18} strokeWidth={1.75} />,
  Truck: <Truck size={18} strokeWidth={1.75} />,
  Laptop: <Laptop size={18} strokeWidth={1.75} />,
  GraduationCap: <GraduationCap size={18} strokeWidth={1.75} />,
  Radio: <Radio size={18} strokeWidth={1.75} />,
};

export const CategorySlider: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [showAll, setShowAll] = useState(false);

  // أول 8 تصنيفات أساسية تظهر مبدئياً، وعند الضغط على "عرض الكل" تظهر الـ 16 بالكامل
  const displayedCategories = showAll ? ALL_OFFICIAL_CATEGORIES : ALL_OFFICIAL_CATEGORIES.slice(0, 8);

  return (
    <div className="space-y-2.5">
      {/* Header with Yellow "عرض الكل" Toggle */}
      <div className="flex items-center justify-between px-0.5">
        <div>
          <h2 className="text-sm sm:text-base font-black text-[#0B1F3A] dark:text-white">
            التصنيفات الرئيسية ({ALL_OFFICIAL_CATEGORIES.length})
          </h2>
          <span className="text-[10px] text-[#64748B] dark:text-[#71717A] block">
            تصفح الأنشطة الاقتصادية والخدمات
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="text-xs font-black text-[#F5C400] hover:underline transition-colors flex items-center gap-1 select-none"
        >
          <span>{showAll ? 'عرض أقل' : 'عرض الكل (16)'}</span>
          <ChevronDown
            size={13}
            strokeWidth={2.5}
            className={cn('transition-transform duration-200', showAll && 'rotate-180')}
          />
        </button>
      </div>

      {/* Grid of 4 columns on mobile, 8 on desktop */}
      <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-2">
        {displayedCategories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onNavigate(cat.href)}
            className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-[12px] bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#222222] hover:border-[#F5C400]/60 active:scale-95 transition-all select-none group min-h-[76px]"
          >
            <div className="w-9 h-9 rounded-[9px] bg-[#0B1F3A]/5 dark:bg-[#181818] text-[#F5C400] flex items-center justify-center group-hover:scale-110 transition-transform">
              {iconMap[cat.iconName] || <Building2 size={18} />}
            </div>
            <span className="text-[10px] font-bold text-[#0B1F3A] dark:text-white text-center leading-tight">
              {cat.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
