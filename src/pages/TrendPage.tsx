import React, { useState, useMemo } from 'react';
import { DEMO_BUSINESSES } from '../data/demoBusinesses';
import { Flame, ArrowRight } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';

export const TrendPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [selectedCat, setSelectedCat] = useState<string>('الكل');

  const categories = ['الكل', 'مطاعم', 'متاجر', 'خدمات'];

  const trendScores: Record<string, number> = {
    t1: 125,
    t2: 98,
    t6: 76,
    t7: 65,
    t8: 54,
    t5: 93,
    t4: 110,
  };

  const filteredItems = useMemo(() => {
    return DEMO_BUSINESSES.filter((b) => {
      if (selectedCat === 'الكل') return true;
      if (selectedCat === 'مطاعم') return b.category === 'المطاعم';
      if (selectedCat === 'متاجر') return b.category === 'المحلات' || b.category === 'محلات الجوالات والإلكترونيات';
      if (selectedCat === 'خدمات') return b.category === 'الخدمات' || b.category === 'السيارات' || b.category === 'الصحة';
      return true;
    })
      .map((item) => ({
        ...item,
        flameCount: trendScores[item.id] || 50,
      }))
      .sort((a, b) => b.flameCount - a.flameCount);
  }, [selectedCat]);

  return (
    <div className="space-y-5 pb-8">
      <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] dark:border-[#222222]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="p-1 rounded-lg text-[#64748B] dark:text-[#A1A1AA] hover:text-[#0B1F3A] dark:hover:text-white"
            aria-label="الرجوع للرئيسية"
          >
            <ArrowRight size={18} strokeWidth={2} />
          </button>
          <h1 className="text-base sm:text-lg font-black text-[#0B1F3A] dark:text-white">
            الترند
          </h1>
        </div>
      </div>

      <div className="flex items-center justify-around border-b border-[#E2E8F0] dark:border-[#222222] pb-1">
        {categories.map((cat) => {
          const isActive = selectedCat === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCat(cat)}
              className={cn(
                'py-2 px-3 text-xs sm:text-sm font-bold transition-all relative select-none',
                isActive
                  ? 'text-[#0B1F3A] dark:text-[#F5C400]'
                  : 'text-[#64748B] dark:text-[#71717A] hover:text-[#0B1F3A] dark:hover:text-white'
              )}
            >
              <span>{cat}</span>
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0B1F3A] dark:bg-[#F5C400] rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      <div className="space-y-2.5">
        {filteredItems.map((item, index) => {
          const rank = index + 1;
          const isTopThree = rank <= 3;

          return (
            <Card
              key={item.id}
              hoverable
              onClick={() => onNavigate(`/business/${item.id}`)}
              className="p-3 bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#222222] flex items-center justify-between gap-3 cursor-pointer rounded-[12px] group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0',
                    isTopThree
                      ? 'bg-[#F5C400] text-[#000000]'
                      : 'bg-[#F1F5F9] dark:bg-[#1A1A1A] text-[#64748B] dark:text-[#A1A1AA]'
                  )}
                >
                  {rank}
                </div>

                {/* Borderless Thumbnail Image */}
                <div className="w-12 h-12 rounded-[9px] overflow-hidden shrink-0 bg-[#0A0A0A] border-0">
                  <img
                    src={item.logoUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>

                <div className="min-w-0">
                  <h3 className="font-bold text-xs sm:text-sm text-[#0B1F3A] dark:text-white truncate">
                    {item.name}
                  </h3>
                  <p className="text-[11px] text-[#64748B] dark:text-[#71717A] truncate">
                    {item.category}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 px-2 py-1 rounded-[6px] bg-[#F7F8FA] dark:bg-[#0A0A0A]">
                <Flame size={14} strokeWidth={2} className="text-[#F59E0B]" />
                <span className="text-xs font-black text-[#0B1F3A] dark:text-white">
                  {item.flameCount}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="pt-2 text-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate('/directory')}
          className="text-xs text-[#0B1F3A] dark:text-[#A1A1AA] hover:text-[#0B1F3A] dark:hover:text-white"
        >
          عرض المزيد في الدليل
        </Button>
      </div>
    </div>
  );
};
