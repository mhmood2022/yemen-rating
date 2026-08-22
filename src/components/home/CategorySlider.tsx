import React, { useState } from 'react';
import {
  Utensils,
  Car,
  Briefcase,
  Store,
  ShoppingCart,
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
  Smartphone,
  ChevronDown,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const CategorySlider: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // أول 5 تصنيفات أساسية تظهر مبدئياً في صف واحد
  const mainFive = [
    { id: 'c1', name: 'مطاعم ومقاهي', icon: Utensils, href: '/directory?category=المطاعم' },
    { id: 'c2', name: 'سيارات', icon: Car, href: '/directory?category=السيارات' },
    { id: 'c3', name: 'خدمات', icon: Briefcase, href: '/directory?category=الخدمات' },
    { id: 'c4', name: 'متاجر', icon: Store, href: '/directory?category=المحلات' },
    { id: 'c5', name: 'صحة وجمال', icon: ShoppingCart, href: '/directory?category=الصحة' },
  ];

  // باقي التصنيفات الـ 11 التي تفتح تحتها مباشرة عند الضغط على عرض الكل
  const remainingCategories = [
    { id: 'c6', name: 'سوق الجوالات', icon: Smartphone, href: '/phones' },
    { id: 'c7', name: 'بنوك مصرفية', icon: Landmark, href: '/banks-wallets' },
    { id: 'c8', name: 'محافظ إلكترونية', icon: Wallet, href: '/banks-wallets' },
    { id: 'c9', name: 'صرافة وتحويلات', icon: Coins, href: '/prices' },
    { id: 'c10', name: 'شركات ومؤسسات', icon: Building2, href: '/directory?category=الشركات' },
    { id: 'c11', name: 'فنادق وسياحة', icon: Hotel, href: '/directory?category=الفنادق' },
    { id: 'c12', name: 'عقارات وأملاك', icon: Home, href: '/directory?category=العقارات' },
    { id: 'c13', name: 'نقل وشحن', icon: Truck, href: '/directory?category=النقل' },
    { id: 'c14', name: 'تقنية وبرمجيات', icon: Laptop, href: '/directory?category=التقنية' },
    { id: 'c15', name: 'تعليم وجامعات', icon: GraduationCap, href: '/directory?category=التعليم' },
    { id: 'c16', name: 'اتصالات وشبكات', icon: Radio, href: '/directory?category=الاتصالات' },
  ];

  return (
    <div className="space-y-2.5">
      {/* Header with Yellow In-Place Accordion Toggle */}
      <div className="flex items-center justify-between px-0.5">
        <h2 className="text-sm sm:text-base font-black text-white">
          التصنيفات الرئيسية
        </h2>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-black text-[#F5C400] hover:underline transition-colors flex items-center gap-1 select-none"
        >
          <span>{isExpanded ? 'عرض أقل' : 'عرض الكل'}</span>
          <ChevronDown
            size={13}
            strokeWidth={2.5}
            className={cn('transition-transform duration-200', isExpanded && 'rotate-180')}
          />
        </button>
      </div>

      {/* Main 5 Cards in Single Row */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {mainFive.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onNavigate(cat.href)}
              className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-[12px] bg-[#111111] border border-[#222222] hover:border-[#F5C400]/50 active:scale-95 transition-all select-none min-h-[74px]"
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

      {/* Expanded Remaining Categories Grid (Appears directly beneath smoothly) */}
      {isExpanded && (
        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 gap-1.5 pt-1 animate-in fade-in slide-in-from-top-2 duration-200">
          {remainingCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onNavigate(cat.href)}
                className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-[12px] bg-[#0E0E0E] border border-[#1E1E1E] hover:border-[#F5C400]/50 active:scale-95 transition-all select-none min-h-[72px]"
              >
                <div className="w-7 h-7 rounded-[7px] bg-[#181818] text-[#F5C400] flex items-center justify-center">
                  <Icon size={16} strokeWidth={2} />
                </div>
                <span className="text-[9px] font-bold text-white text-center leading-tight">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
