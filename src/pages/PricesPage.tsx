import React, { useState } from 'react';
import { DEMO_CURRENCIES, DEMO_GOLD } from '../data/demoPrices';
import { Clock, ArrowRight } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { cn } from '../lib/utils';

export const PricesPage: React.FC<{ onNavigate?: (path: string) => void }> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'currencies' | 'gold'>('currencies');
  const [selectedMarket, setSelectedMarket] = useState<'sanaa' | 'aden'>('sanaa');

  const currenciesList = DEMO_CURRENCIES.filter((c) => c.market === selectedMarket);
  const goldList = DEMO_GOLD.filter((g) => g.market === selectedMarket);

  const flagMap: Record<string, string> = {
    USD: '🇺🇸',
    SAR: '🇸🇦',
    AED: '🇦🇪',
    EUR: '🇪🇺',
  };

  return (
    <div className="space-y-4 pb-8 max-w-lg mx-auto">
      {/* Top Header with Back Navigation & Market Selector */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] dark:border-[#222222]">
        <div className="flex items-center gap-2">
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="p-1 rounded-lg text-[#64748B] dark:text-[#A1A1AA] hover:text-[#0B1F3A] dark:hover:text-white"
              aria-label="الرجوع"
            >
              <ArrowRight size={18} strokeWidth={2} />
            </button>
          )}
          <h1 className="text-base sm:text-lg font-black text-[#0B1F3A] dark:text-white">
            الأسعار
          </h1>
        </div>

        {/* Market Pill */}
        <div className="flex items-center gap-1 p-0.5 bg-[#F1F5F9] dark:bg-[#141414] rounded-[8px] border border-[#E2E8F0] dark:border-[#222222] text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setSelectedMarket('sanaa')}
            className={cn(
              'px-3 py-1 rounded-[6px] transition-all',
              selectedMarket === 'sanaa'
                ? 'bg-[#F5C400] text-black font-black'
                : 'text-[#64748B] dark:text-[#71717A]'
            )}
          >
            صنعاء
          </button>
          <button
            type="button"
            onClick={() => setSelectedMarket('aden')}
            className={cn(
              'px-3 py-1 rounded-[6px] transition-all',
              selectedMarket === 'aden'
                ? 'bg-[#F5C400] text-black font-black'
                : 'text-[#64748B] dark:text-[#71717A]'
            )}
          >
            عدن
          </button>
        </div>
      </div>

      {/* Tabs (العملات / الذهب) */}
      <div className="flex items-center justify-around border-b border-[#E2E8F0] dark:border-[#222222] pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('currencies')}
          className={cn(
            'py-2 px-6 text-xs sm:text-sm font-bold transition-all relative select-none',
            activeTab === 'currencies'
              ? 'text-[#0B1F3A] dark:text-[#F5C400]'
              : 'text-[#64748B] dark:text-[#71717A] hover:text-[#0B1F3A] dark:hover:text-white'
          )}
        >
          <span>العملات</span>
          {activeTab === 'currencies' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0B1F3A] dark:bg-[#F5C400] rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('gold')}
          className={cn(
            'py-2 px-6 text-xs sm:text-sm font-bold transition-all relative select-none',
            activeTab === 'gold'
              ? 'text-[#0B1F3A] dark:text-[#F5C400]'
              : 'text-[#64748B] dark:text-[#71717A] hover:text-[#0B1F3A] dark:hover:text-white'
          )}
        >
          <span>الذهب</span>
          {activeTab === 'gold' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0B1F3A] dark:bg-[#F5C400] rounded-full" />
          )}
        </button>
      </div>

      {/* Clean Financial Cards (Matching Screenshot 1) */}
      {activeTab === 'currencies' && (
        <div className="space-y-2.5">
          {currenciesList.map((c) => (
            <Card
              key={c.id}
              className="p-3.5 bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#222222] rounded-[12px] flex items-center justify-between gap-3"
            >
              {/* Right: Flag & Currency Title */}
              <div className="flex items-center gap-2.5">
                <span className="text-xl" role="img" aria-label={c.currencyCode}>
                  {flagMap[c.currencyCode] || '💵'}
                </span>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-[#0B1F3A] dark:text-white leading-tight">
                    {c.currencyName}
                  </h3>
                  <span className="text-[10px] text-[#64748B] dark:text-[#71717A] font-semibold">
                    {c.currencyCode}
                  </span>
                </div>
              </div>

              {/* Left: Buy (Green) & Sell (White) Prices */}
              <div className="flex items-center gap-5 text-left">
                <div>
                  <span className="text-[9px] text-[#64748B] dark:text-[#71717A] block font-semibold">شراء</span>
                  <span className="text-xs sm:text-sm font-black text-[#16A34A] dark:text-[#22C55E]">
                    {c.buyPrice.toLocaleString()}
                  </span>
                </div>

                <div>
                  <span className="text-[9px] text-[#64748B] dark:text-[#71717A] block font-semibold">بيع</span>
                  <span className="text-xs sm:text-sm font-black text-[#0B1F3A] dark:text-white">
                    {c.sellPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'gold' && (
        <div className="space-y-2.5">
          {goldList.map((g) => (
            <Card
              key={g.id}
              className="p-3.5 bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#222222] rounded-[12px] flex items-center justify-between gap-3"
            >
              <div className="space-y-0.5">
                <h3 className="font-bold text-xs sm:text-sm text-[#0B1F3A] dark:text-white">
                  {g.karatName}
                </h3>
                <span className="text-[10px] text-[#64748B] dark:text-[#71717A] font-semibold">
                  ريال يمني / {g.unit}
                </span>
              </div>

              <div className="flex items-center gap-5 text-left">
                <div>
                  <span className="text-[9px] text-[#64748B] dark:text-[#71717A] block font-semibold">شراء</span>
                  <span className="text-xs sm:text-sm font-black text-[#16A34A] dark:text-[#22C55E]">
                    {g.buyPrice.toLocaleString()}
                  </span>
                </div>

                <div>
                  <span className="text-[9px] text-[#64748B] dark:text-[#71717A] block font-semibold">بيع</span>
                  <span className="text-xs sm:text-sm font-black text-[#0B1F3A] dark:text-[#F5C400]">
                    {g.sellPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Footer Timestamp */}
      <div className="pt-2 text-center text-[11px] text-[#64748B] dark:text-[#71717A] flex items-center justify-center gap-1.5">
        <Clock size={12} strokeWidth={1.75} />
        <span>آخر تحديث: منذ 5 دقائق ({selectedMarket === 'sanaa' ? 'سوق صنعاء' : 'سوق عدن'})</span>
      </div>
    </div>
  );
};
