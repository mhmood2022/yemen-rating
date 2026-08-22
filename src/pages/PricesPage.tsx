import React, { useState, useMemo } from 'react';
import { DEMO_CURRENCIES, DEMO_GOLD, DEMO_COMMODITIES } from '../data/demoPrices';
import { PriceCategoryType, PriceMarket } from '../types/prices';
import { PriceCard } from '../components/prices/PriceCard';
import { SearchInput } from '../components/ui/SearchInput';
import { Select } from '../ui/Select';
import { EmptyState } from '../components/ui/EmptyState';
import { Coins, Sparkles, Utensils, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';
import { yrToast } from '../components/ui/Toast';

export const PricesPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<PriceCategoryType>('currencies');
  const [selectedMarket, setSelectedMarket] = useState<'all' | PriceMarket>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const categoryTabs = [
    { id: 'currencies' as const, label: 'صرف العملات', icon: Coins, count: DEMO_CURRENCIES.length },
    { id: 'gold' as const, label: 'أسعار الذهب', icon: Sparkles, count: DEMO_GOLD.length },
    { id: 'commodities' as const, label: 'السلع والمشتقات', icon: Utensils, count: DEMO_COMMODITIES.length },
  ];

  const marketOptions = [
    { label: 'جميع الأسواق (صنعاء وعدن)', value: 'all' },
    { label: 'سوق صنعاء فقط', value: 'sanaa' },
    { label: 'سوق عدن فقط', value: 'aden' },
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      yrToast.success('تم تحديث الأسعار بنجاح وفق آخر التداولات');
    }, 500);
  };

  // Filter Logic
  const filteredCurrencies = useMemo(() => {
    return DEMO_CURRENCIES.filter((c) => {
      if (selectedMarket !== 'all' && c.market !== selectedMarket) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return c.currencyName.toLowerCase().includes(q) || c.currencyCode.toLowerCase().includes(q);
      }
      return true;
    });
  }, [selectedMarket, searchQuery]);

  const filteredGold = useMemo(() => {
    return DEMO_GOLD.filter((g) => {
      if (selectedMarket !== 'all' && g.market !== selectedMarket) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return g.karatName.toLowerCase().includes(q);
      }
      return true;
    });
  }, [selectedMarket, searchQuery]);

  const filteredCommodities = useMemo(() => {
    return DEMO_COMMODITIES.filter((cmd) => {
      if (selectedMarket !== 'all' && cmd.market !== selectedMarket) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return cmd.commodityName.toLowerCase().includes(q);
      }
      return true;
    });
  }, [selectedMarket, searchQuery]);

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0B1F3A] dark:text-white">
            الأسعار
          </h1>
          <p className="text-xs text-[#64748B] dark:text-[#A1A1AA]">
            النشرة الاقتصادية اليومية المحدثة لأسعار صرف العملات والذهب والسلع الأساسية في سوقي صنعاء وعدن
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[9px] border border-[#E2E8F0] dark:border-[#222222] bg-white dark:bg-[#0E0E0E] text-xs font-bold text-[#0B1F3A] dark:text-[#F5C400] hover:bg-[#F1F5F9] dark:hover:bg-[#1A1A1A] transition-colors self-start sm:self-auto"
        >
          <RefreshCw size={13} strokeWidth={2} className={cn(isRefreshing && 'animate-spin')} />
          <span>تحديث الأسعار</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 p-1 bg-white dark:bg-[#0A0A0A] border border-[#E2E8F0] dark:border-[#222222] rounded-[12px]">
        {categoryTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCategory(tab.id)}
              className={cn(
                'flex-1 py-2 px-3 rounded-[9px] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all select-none',
                isActive
                  ? 'bg-[#0B1F3A] text-white dark:bg-[#F5C400] dark:text-[#000000] shadow-sm'
                  : 'text-[#475569] dark:text-[#A1A1AA] hover:bg-[#F1F5F9] dark:hover:bg-[#141414] hover:text-[#0B1F3A] dark:hover:text-white'
              )}
            >
              <Icon size={16} strokeWidth={1.75} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Toolbar: Market Filter & Search */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
        <div className="sm:col-span-8">
          <SearchInput
            placeholder="ابحث بالاسم، العملة، السلعة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
          />
        </div>

        <div className="sm:col-span-4">
          <Select
            value={selectedMarket}
            options={marketOptions}
            onChange={(val) => setSelectedMarket(val as any)}
          />
        </div>
      </div>

      {/* Content Rendering */}
      <div>
        {activeCategory === 'currencies' && (
          <div>
            {filteredCurrencies.length === 0 ? (
              <EmptyState title="لم يتم العثور على نتائج للعملات" description="جرب البحث بكلمة أخرى أو تغيير السوق المحدد." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3.5">
                {filteredCurrencies.map((c) => (
                  <PriceCard
                    key={c.id}
                    title={c.currencyName}
                    subtitle={`${c.currencyCode} (${c.symbol})`}
                    market={c.market}
                    buyPrice={c.buyPrice}
                    sellPrice={c.sellPrice}
                    change={c.change}
                    changeAmount={c.changeAmount}
                    source={c.source}
                    lastUpdated={c.lastUpdated}
                    type="currency"
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeCategory === 'gold' && (
          <div>
            {filteredGold.length === 0 ? (
              <EmptyState title="لم يتم العثور على نتائج للذهب" description="جرب البحث بكلمة أخرى أو تغيير السوق المحدد." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3.5">
                {filteredGold.map((g) => (
                  <PriceCard
                    key={g.id}
                    title={g.karatName}
                    subtitle={`سعر الـ ${g.unit}`}
                    market={g.market}
                    buyPrice={g.buyPrice}
                    sellPrice={g.sellPrice}
                    change={g.change}
                    changeAmount={g.changeAmount}
                    source={g.source}
                    lastUpdated={g.lastUpdated}
                    type="gold"
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeCategory === 'commodities' && (
          <div>
            {filteredCommodities.length === 0 ? (
              <EmptyState title="لم يتم العثور على نتائج للسلع" description="جرب البحث بكلمة أخرى أو تغيير السوق المحدد." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3.5">
                {filteredCommodities.map((cmd) => (
                  <PriceCard
                    key={cmd.id}
                    title={cmd.commodityName}
                    subtitle={cmd.category === 'fuel' ? 'مشتقات نفطية' : 'مواد غذائية أساسية'}
                    market={cmd.market}
                    unitPrice={cmd.price}
                    unit={cmd.unit}
                    change={cmd.change}
                    changeAmount={cmd.changeAmount}
                    source={cmd.source}
                    lastUpdated={cmd.lastUpdated}
                    type="commodity"
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
