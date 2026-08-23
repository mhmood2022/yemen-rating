import React, { useState } from 'react';
import { DEMO_CURRENCIES, DEMO_GOLD } from '../data/demoPrices';
import { Clock, ArrowRight, ArrowLeftRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { cn } from '../lib/utils';

export const PricesPage: React.FC<{ onNavigate?: (path: string) => void }> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'currencies' | 'gold'>('currencies');
  const [marketView, setMarketView] = useState<'sanaa' | 'aden' | 'compare'>('compare');

  const currenciesSanaa = DEMO_CURRENCIES.filter((c) => c.market === 'sanaa');
  const currenciesAden = DEMO_CURRENCIES.filter((c) => c.market === 'aden');

  const goldSanaa = DEMO_GOLD.filter((g) => g.market === 'sanaa');
  const goldAden = DEMO_GOLD.filter((g) => g.market === 'aden');

  // قائمة العملات المرتبة (الدولار أولاً ثم السعودي ثم باقي العملات)
  const currencyPairs = [
    { code: 'USD', name: 'الدولار الأمريكي', flag: '🇺🇸' },
    { code: 'SAR', name: 'الريال السعودي', flag: '🇸🇦' },
    { code: 'AED', name: 'الدرهم الإماراتي', flag: '🇦🇪' },
    { code: 'EUR', name: 'اليورو الأوروبي', flag: '🇪🇺' },
  ];

  const goldPairs = [
    { id: '21', name: 'ذهب عيار 21 (الأكثر تداولاً)', unit: 'جرام' },
    { id: '24', name: 'ذهب عيار 24', unit: 'جرام' },
    { id: '18', name: 'ذهب عيار 18', unit: 'جرام' },
    { id: 'pnd', name: 'الجنيه الذهب (8 جرام)', unit: 'حبة' },
  ];

  const renderLiveTrend = (change: 'up' | 'down' | 'stable', text?: string) => {
    if (change === 'up') {
      return (
        <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-[#EF4444] bg-[#EF4444]/10 px-1.5 py-0.5 rounded">
          <TrendingUp size={11} strokeWidth={2.5} className="animate-bounce" />
          <span>{text || '+0.3%'}</span>
        </span>
      );
    }
    if (change === 'down') {
      return (
        <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-[#22C55E] bg-[#22C55E]/10 px-1.5 py-0.5 rounded">
          <TrendingDown size={11} strokeWidth={2.5} className="animate-pulse" />
          <span>{text || '-0.2%'}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-[#F5C400] bg-[#F5C400]/10 px-1.5 py-0.5 rounded">
        <Minus size={11} strokeWidth={2.5} />
        <span>ثابت</span>
      </span>
    );
  };

  return (
    <div className="space-y-4 pb-8 max-w-lg mx-auto">
      {/* 1. Header with Market View Selector (صنعاء / عدن / مقارنة السوقين) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-[#E2E8F0] dark:border-[#222222]">
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
          <div>
            <h1 className="text-base sm:text-lg font-black text-[#0B1F3A] dark:text-white leading-tight">
              أسعار الصرف والذهب
            </h1>
            <span className="text-[10px] text-[#64748B] dark:text-[#71717A] block">
              مقابل الريال اليمني (YER)
            </span>
          </div>
        </div>

        {/* 3-Way Market Selector Pill */}
        <div className="flex items-center gap-1 p-0.5 bg-[#F1F5F9] dark:bg-[#141414] rounded-[9px] border border-[#E2E8F0] dark:border-[#222222] text-[11px] font-bold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMarketView('sanaa')}
            className={cn(
              'px-2.5 py-1 rounded-[7px] transition-all select-none',
              marketView === 'sanaa'
                ? 'bg-[#0B1F3A] text-white dark:bg-[#F5C400] dark:text-black font-black'
                : 'text-[#64748B] dark:text-[#71717A]'
            )}
          >
            صنعاء
          </button>
          <button
            type="button"
            onClick={() => setMarketView('aden')}
            className={cn(
              'px-2.5 py-1 rounded-[7px] transition-all select-none',
              marketView === 'aden'
                ? 'bg-[#0B1F3A] text-white dark:bg-[#F5C400] dark:text-black font-black'
                : 'text-[#64748B] dark:text-[#71717A]'
            )}
          >
            عدن
          </button>
          <button
            type="button"
            onClick={() => setMarketView('compare')}
            className={cn(
              'px-2.5 py-1 rounded-[7px] flex items-center gap-1 transition-all select-none',
              marketView === 'compare'
                ? 'bg-[#F5C400] text-black font-black shadow-sm'
                : 'text-[#F5C400] hover:bg-[#F5C400]/10'
            )}
          >
            <ArrowLeftRight size={11} strokeWidth={2.5} />
            <span>مقارنة السوقين</span>
          </button>
        </div>
      </div>

      {/* 2. Category Tabs */}
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
          <span>صرف العملات (دولار · سعودي)</span>
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
          <span>أسعار الذهب</span>
          {activeTab === 'gold' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0B1F3A] dark:bg-[#F5C400] rounded-full" />
          )}
        </button>
      </div>

      {/* 3. COMPARE VIEW (مقارنة صنعاء وعدن جنباً إلى جنب) */}
      {marketView === 'compare' && activeTab === 'currencies' && (
        <div className="space-y-3">
          {currencyPairs.map((pair) => {
            const san = currenciesSanaa.find((c) => c.currencyCode === pair.code) || currenciesSanaa[0];
            const adn = currenciesAden.find((c) => c.currencyCode === pair.code) || currenciesAden[0];
            const diffSell = adn.sellPrice - san.sellPrice;

            return (
              <Card
                key={pair.code}
                className="p-3.5 bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#222222] rounded-[14px] space-y-3"
              >
                {/* Header: Currency + Flag + Difference */}
                <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9] dark:border-[#1C1C1C]">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{pair.flag}</span>
                    <div>
                      <h3 className="font-bold text-xs sm:text-sm text-[#0B1F3A] dark:text-white leading-tight">
                        {pair.name}
                      </h3>
                      <span className="text-[10px] text-[#64748B] dark:text-[#71717A] font-bold">
                        {pair.code} مقابل الريال اليمني
                      </span>
                    </div>
                  </div>

                  <div className="text-left">
                    <span className="text-[9px] text-[#64748B] dark:text-[#71717A] block font-semibold">فارق السعر</span>
                    <span className="text-xs font-black text-[#F5C400] bg-[#F5C400]/10 px-2 py-0.5 rounded-[5px]">
                      +{diffSell.toLocaleString()} ريال
                    </span>
                  </div>
                </div>

                {/* Side-by-Side Columns (Sanaa vs Aden) */}
                <div className="grid grid-cols-2 gap-2 text-center">
                  {/* Sanaa Box */}
                  <div className="p-2.5 rounded-[10px] bg-[#F7F8FA] dark:bg-[#070707] border border-[#E2E8F0] dark:border-[#1E1E1E] space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold pb-1 border-b border-[#E2E8F0] dark:border-[#1A1A1A]">
                      <span className="text-[#0B1F3A] dark:text-white">سوق صنعاء</span>
                      {renderLiveTrend(san.change)}
                    </div>
                    <div className="grid grid-cols-2 gap-1 pt-1 text-[11px]">
                      <div>
                        <span className="text-[9px] text-[#64748B] dark:text-[#71717A] block">شراء</span>
                        <span className="font-black text-[#16A34A] dark:text-[#22C55E]">{san.buyPrice}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-[#64748B] dark:text-[#71717A] block">بيع</span>
                        <span className="font-black text-[#0B1F3A] dark:text-white">{san.sellPrice}</span>
                      </div>
                    </div>
                  </div>

                  {/* Aden Box */}
                  <div className="p-2.5 rounded-[10px] bg-[#F7F8FA] dark:bg-[#070707] border border-[#E2E8F0] dark:border-[#1E1E1E] space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold pb-1 border-b border-[#E2E8F0] dark:border-[#1A1A1A]">
                      <span className="text-[#0B1F3A] dark:text-[#F5C400]">سوق عدن</span>
                      {renderLiveTrend(adn.change)}
                    </div>
                    <div className="grid grid-cols-2 gap-1 pt-1 text-[11px]">
                      <div>
                        <span className="text-[9px] text-[#64748B] dark:text-[#71717A] block">شراء</span>
                        <span className="font-black text-[#16A34A] dark:text-[#22C55E]">{adn.buyPrice}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-[#64748B] dark:text-[#71717A] block">بيع</span>
                        <span className="font-black text-[#0B1F3A] dark:text-white">{adn.sellPrice}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* 4. COMPARE VIEW FOR GOLD */}
      {marketView === 'compare' && activeTab === 'gold' && (
        <div className="space-y-3">
          {goldPairs.map((pair) => {
            const san = goldSanaa.find((g) => g.karatName.includes(pair.id)) || goldSanaa[0];
            const adn = goldAden.find((g) => g.karatName.includes(pair.id)) || goldAden[0];
            const diffSell = adn.sellPrice - san.sellPrice;

            return (
              <Card
                key={pair.id}
                className="p-3.5 bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#222222] rounded-[14px] space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9] dark:border-[#1C1C1C]">
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-[#0B1F3A] dark:text-white leading-tight">
                      {pair.name}
                    </h3>
                    <span className="text-[10px] text-[#64748B] dark:text-[#71717A] font-bold">
                      ريال يمني / {pair.unit}
                    </span>
                  </div>

                  <div className="text-left">
                    <span className="text-[9px] text-[#64748B] dark:text-[#71717A] block font-semibold">فارق السعر</span>
                    <span className="text-xs font-black text-[#F5C400] bg-[#F5C400]/10 px-2 py-0.5 rounded-[5px]">
                      +{diffSell.toLocaleString()} ريال
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center">
                  {/* Sanaa Gold */}
                  <div className="p-2.5 rounded-[10px] bg-[#F7F8FA] dark:bg-[#070707] border border-[#E2E8F0] dark:border-[#1E1E1E] space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold pb-1 border-b border-[#E2E8F0] dark:border-[#1A1A1A]">
                      <span className="text-[#0B1F3A] dark:text-white">صنعاء</span>
                      {renderLiveTrend(san.change)}
                    </div>
                    <div className="grid grid-cols-2 gap-1 pt-1 text-[11px]">
                      <div>
                        <span className="text-[9px] text-[#64748B] dark:text-[#71717A] block">شراء</span>
                        <span className="font-black text-[#16A34A] dark:text-[#22C55E] text-[10px]">{san.buyPrice.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-[#64748B] dark:text-[#71717A] block">بيع</span>
                        <span className="font-black text-[#0B1F3A] dark:text-white text-[10px]">{san.sellPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Aden Gold */}
                  <div className="p-2.5 rounded-[10px] bg-[#F7F8FA] dark:bg-[#070707] border border-[#E2E8F0] dark:border-[#1E1E1E] space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold pb-1 border-b border-[#E2E8F0] dark:border-[#1A1A1A]">
                      <span className="text-[#0B1F3A] dark:text-[#F5C400]">عدن</span>
                      {renderLiveTrend(adn.change)}
                    </div>
                    <div className="grid grid-cols-2 gap-1 pt-1 text-[11px]">
                      <div>
                        <span className="text-[9px] text-[#64748B] dark:text-[#71717A] block">شراء</span>
                        <span className="font-black text-[#16A34A] dark:text-[#22C55E] text-[10px]">{adn.buyPrice.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-[#64748B] dark:text-[#71717A] block">بيع</span>
                        <span className="font-black text-[#0B1F3A] dark:text-white text-[10px]">{adn.sellPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* 5. SINGLE MARKET VIEW (صنعاء فقط أو عدن فقط) */}
      {marketView !== 'compare' && activeTab === 'currencies' && (
        <div className="space-y-2.5">
          {(marketView === 'sanaa' ? currenciesSanaa : currenciesAden).map((c) => (
            <Card
              key={c.id}
              className="p-3.5 bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#222222] rounded-[12px] flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xl">{currencyPairs.find((p) => p.code === c.currencyCode)?.flag || '💵'}</span>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-[#0B1F3A] dark:text-white leading-tight">
                    {c.currencyName}
                  </h3>
                  <span className="text-[10px] text-[#64748B] dark:text-[#71717A] font-bold">
                    {c.currencyCode} / YER
                  </span>
                </div>
              </div>

              {renderLiveTrend(c.change, c.changeAmount)}

              <div className="flex items-center gap-4 text-left">
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

      {marketView !== 'compare' && activeTab === 'gold' && (
        <div className="space-y-2.5">
          {(marketView === 'sanaa' ? goldSanaa : goldAden).map((g) => (
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

              {renderLiveTrend(g.change, g.changeAmount)}

              <div className="flex items-center gap-4 text-left">
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
        <span>آخر تحديث حي: منذ دقيقتين (تحديث تلقائي)</span>
      </div>
    </div>
  );
};
