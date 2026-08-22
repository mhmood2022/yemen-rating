import React from 'react';
import { MAIN_CATEGORIES } from '../../data/demoHome';
import { Utensils, Car, Briefcase, Store, HeartPulse, ArrowLeft } from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  Utensils: <Utensils size={19} strokeWidth={1.75} />,
  Car: <Car size={19} strokeWidth={1.75} />,
  Briefcase: <Briefcase size={19} strokeWidth={1.75} />,
  Store: <Store size={19} strokeWidth={1.75} />,
  HeartPulse: <HeartPulse size={19} strokeWidth={1.75} />,
};

export const CategorySlider: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between px-0.5">
        <h2 className="text-sm sm:text-base font-black text-[#0B1F3A] dark:text-white">
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

      {/* 5 Compact Category Cards with Full Readable Text */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2.5">
        {MAIN_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onNavigate(cat.href)}
            className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-[12px] bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#222222] hover:border-[#F5C400]/50 transition-all select-none group min-h-[78px]"
          >
            <div className="w-9 h-9 rounded-[9px] bg-[#0B1F3A]/5 dark:bg-[#181818] text-[#F5C400] flex items-center justify-center group-hover:scale-105 transition-transform">
              {iconMap[cat.iconName]}
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
