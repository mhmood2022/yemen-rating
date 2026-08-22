import React, { useState } from 'react';
import { BusinessItem } from '../../../types/business';
import { Card } from '../../ui/Card';
import { Utensils, Tag } from 'lucide-react';
import { cn } from '../../../lib/utils';

export const MenuSection: React.FC<{ business: BusinessItem }> = ({ business }) => {
  const menuItems = business.menuItems || [];
  
  // Extract unique menu categories
  const categories = Array.from(new Set(menuItems.map((m) => m.categoryName)));
  const [selectedCat, setSelectedCat] = useState<string>(categories[0] || 'الكل');

  const filteredItems = selectedCat === 'الكل'
    ? menuItems
    : menuItems.filter((m) => m.categoryName === selectedCat);

  if (menuItems.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Category Pills */}
      {categories.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <button
            type="button"
            onClick={() => setSelectedCat('الكل')}
            className={cn(
              'px-3 py-1.5 rounded-[8px] text-xs font-bold whitespace-nowrap transition-all',
              selectedCat === 'الكل'
                ? 'bg-[#0B1F3A] text-white dark:bg-[#F5C400] dark:text-black'
                : 'bg-white dark:bg-[#111111] text-[#64748B] dark:text-[#A1A1AA] border border-[#E2E8F0] dark:border-[#222222]'
            )}
          >
            الكل
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setSelectedCat(c)}
              className={cn(
                'px-3 py-1.5 rounded-[8px] text-xs font-bold whitespace-nowrap transition-all',
                selectedCat === c
                  ? 'bg-[#0B1F3A] text-white dark:bg-[#F5C400] dark:text-black'
                  : 'bg-white dark:bg-[#111111] text-[#64748B] dark:text-[#A1A1AA] border border-[#E2E8F0] dark:border-[#222222]'
              )}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredItems.map((item) => (
          <Card key={item.id} className="p-3 bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#222222] rounded-[12px] flex items-center justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs sm:text-sm text-[#0B1F3A] dark:text-white truncate">
                  {item.name}
                </span>
                {item.isSpecialty && (
                  <span className="text-[9px] font-black text-[#F5C400] bg-[#F5C400]/15 px-1.5 py-0.2 rounded">
                    مميز
                  </span>
                )}
              </div>
              {item.description && (
                <p className="text-[11px] text-[#64748B] dark:text-[#71717A] line-clamp-1">{item.description}</p>
              )}
            </div>

            <span className="text-xs sm:text-sm font-black text-[#16A34A] dark:text-[#22C55E] shrink-0">
              {item.price}
            </span>
          </Card>
        ))}
      </div>
    </div>
  );
};
