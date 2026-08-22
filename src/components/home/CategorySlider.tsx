import React from 'react';
import { MAIN_CATEGORIES } from '../../data/demoHome';
import { Utensils, Car, Briefcase, Store, HeartPulse, ArrowLeft } from 'lucide-react';
import { cn } from '../../lib/utils';

const iconMap: Record<string, React.ReactNode> = {
  Utensils: <Utensils size={20} strokeWidth={1.75} />,
  Car: <Car size={20} strokeWidth={1.75} />,
  Briefcase: <Briefcase size={20} strokeWidth={1.75} />,
  Store: <Store size={20} strokeWidth={1.75} />,
  HeartPulse: <HeartPulse size={20} strokeWidth={1.75} />,
};

export const CategorySlider: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between px-0.5">
        <h2 className="text-sm sm:text-base font-bold text-[#0B1F3A] dark:text-white">
          التصنيفات الرئيسية
        </h2>
        <button
          type="button"
          onClick={() => onNavigate('/directory')}
          className="text-xs font-semibold text-[#64748B] dark:text-[#A1A1AA] hover:text-[#0B1F3A] dark:hover:text-[#F5C400] transition-colors flex items-center gap-1"
        >
          <span>عرض الكل</span>
          <ArrowLeft size={12} strokeWidth={1.75} />
        </button>
      </div>

      {/* Categories Grid (5 columns on mobile) */}
      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {MAIN_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onNavigate(cat.href)}
            className="flex flex-col items-center justify-center gap-2 p-2.5 sm:p-3 rounded-[12px] bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#222222] hover:border-[#F5C400]/50 transition-all select-none group"
          >
            <div className="w-10 h-10 rounded-[10px] bg-[#0B1F3A]/5 dark:bg-[#181818] text-[#F5C400] flex items-center justify-center group-hover:scale-105 transition-transform">
              {iconMap[cat.iconName]}
            </div>
            <span className="text-[11px] font-bold text-[#0B1F3A] dark:text-white text-center leading-tight line-clamp-1">
              {cat.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
