import React from 'react';
import { Utensils, Car, Briefcase, Store, ShoppingCart } from 'lucide-react';

export const CategorySlider: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const categories = [
    { id: 'c1', name: 'مطاعم ومقاهي', icon: Utensils, href: '/directory?category=المطاعم' },
    { id: 'c2', name: 'سيارات', icon: Car, href: '/directory?category=السيارات' },
    { id: 'c3', name: 'خدمات', icon: Briefcase, href: '/directory?category=الخدمات' },
    { id: 'c4', name: 'متاجر', icon: Store, href: '/directory?category=المحلات' },
    { id: 'c5', name: 'صحة وجمال', icon: ShoppingCart, href: '/directory?category=الصحة' },
  ];

  return (
    <div className="space-y-2.5">
      {/* Header with Yellow "عرض الكل" */}
      <div className="flex items-center justify-between px-0.5">
        <h2 className="text-sm sm:text-base font-black text-white">
          التصنيفات الرئيسية
        </h2>
        <button
          type="button"
          onClick={() => onNavigate('/directory')}
          className="text-xs font-black text-[#F5C400] hover:underline transition-colors"
        >
          عرض الكل
        </button>
      </div>

      {/* 5 Compact Cards in 1 Row */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onNavigate(cat.href)}
              className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-[12px] bg-[#111111] border border-[#222222] hover:border-[#F5C400]/50 active:scale-95 transition-all select-none min-h-[76px]"
            >
              <div className="w-8 h-8 rounded-[8px] bg-[#181818] text-[#F5C400] flex items-center justify-center">
                <Icon size={18} strokeWidth={2} />
              </div>
              <span className="text-[10px] font-bold text-white text-center leading-tight">
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
