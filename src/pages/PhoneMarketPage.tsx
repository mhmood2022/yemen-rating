import React, { useState, useMemo } from 'react';
import { DEMO_PHONES_DATA } from '../data/demoPhones';
import { DEMO_BUSINESSES, CITIES_LIST } from '../data/demoBusinesses';
import { PhoneCategoryType } from '../types/phones';
import { PhoneDeviceCard } from '../components/phones/PhoneDeviceCard';
import { BusinessCard } from '../components/business/BusinessCard';
import { SearchInput } from '../components/ui/SearchInput';
import { Select } from '../components/ui/Select';
import { EmptyState } from '../components/ui/EmptyState';
import { Smartphone, Wrench, Sparkles, Tag, Store, Radio, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

export const PhoneMarketPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [activeCategory, setActiveCategory] = useState<PhoneCategoryType>('all');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'devices' | 'stores'>('devices');

  const categories = [
    { id: 'all' as const, label: 'الكل', icon: Sparkles },
    { id: 'phones' as const, label: 'الجوالات', icon: Smartphone },
    { id: 'accessories' as const, label: 'الإكسسوارات والشواحن', icon: Tag },
    { id: 'maintenance' as const, label: 'الصيانة والقطع', icon: Wrench },
    { id: 'sim_services' as const, label: 'الشرائح والخدمات', icon: Radio },
  ];

  const cityOptions = [
    { label: 'جميع المدن', value: '' },
    ...CITIES_LIST.map((c) => ({ label: c, value: c })),
  ];

  const brandOptions = [
    { label: 'جميع الماركات', value: '' },
    { label: 'Apple (آبل)', value: 'Apple' },
    { label: 'Samsung (سامسونج)', value: 'Samsung' },
    { label: 'Xiaomi (شاومي)', value: 'Xiaomi' },
    { label: 'Anker (أنكر)', value: 'Anker' },
  ];

  // Filtered Devices
  const filteredDevices = useMemo(() => {
    return DEMO_PHONES_DATA.filter((item) => {
      if (activeCategory !== 'all' && item.category !== activeCategory) return false;
      if (selectedCity && item.city !== selectedCity) return false;
      if (selectedBrand && !item.brand.toLowerCase().includes(selectedBrand.toLowerCase())) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.brand.toLowerCase().includes(q) ||
          item.storeName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [activeCategory, selectedCity, selectedBrand, searchQuery]);

  // Phone Stores List
  const phoneStores = useMemo(() => {
    return DEMO_BUSINESSES.filter((b) => b.category === 'محلات الجوالات والإلكترونيات');
  }, []);

  return (
    <div className="space-y-5 pb-8 max-w-2xl mx-auto">
      {/* Header */}
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
          <div>
            <h1 className="text-base sm:text-lg font-black text-[#0B1F3A] dark:text-white leading-tight">
              سوق الجوالات
            </h1>
            <span className="text-[10px] text-[#64748B] dark:text-[#71717A] block">
              الأجهزة الجديدة والمستخدمة، الصيانة، والإكسسوارات في اليمن
            </span>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 p-0.5 bg-[#F1F5F9] dark:bg-[#141414] rounded-[8px] border border-[#E2E8F0] dark:border-[#222222] text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setViewMode('devices')}
            className={cn(
              'px-2.5 py-1 rounded-[6px] transition-all',
              viewMode === 'devices'
                ? 'bg-[#F5C400] text-black font-black'
                : 'text-[#64748B] dark:text-[#71717A]'
            )}
          >
            الأجهزة والعروض
          </button>
          <button
            type="button"
            onClick={() => setViewMode('stores')}
            className={cn(
              'px-2.5 py-1 rounded-[6px] transition-all',
              viewMode === 'stores'
                ? 'bg-[#F5C400] text-black font-black'
                : 'text-[#64748B] dark:text-[#71717A]'
            )}
          >
            المحلات المعتمدة
          </button>
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-[9px] text-xs font-bold whitespace-nowrap transition-all select-none',
                isActive
                  ? 'bg-[#0B1F3A] text-white dark:bg-[#F5C400] dark:text-black shadow-sm'
                  : 'bg-white dark:bg-[#111111] text-[#475569] dark:text-[#A1A1AA] border border-[#E2E8F0] dark:border-[#222222] hover:border-[#F5C400]/40'
              )}
            >
              <Icon size={14} strokeWidth={2} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search & Select Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
        <div className="sm:col-span-6">
          <SearchInput
            placeholder="ابحث عن هاتف، شاحن، أو مركز صيانة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
          />
        </div>

        <div className="sm:col-span-3">
          <Select
            value={selectedCity}
            options={cityOptions}
            onChange={setSelectedCity}
            placeholder="جميع المدن"
          />
        </div>

        <div className="sm:col-span-3">
          <Select
            value={selectedBrand}
            options={brandOptions}
            onChange={setSelectedBrand}
            placeholder="جميع الماركات"
          />
        </div>
      </div>

      {/* Content Rendering: Devices Grid OR Stores Grid */}
      {viewMode === 'devices' ? (
        <div>
          {filteredDevices.length === 0 ? (
            <EmptyState
              title="لم يتم العثور على أجهزة تطابق بحثك"
              description="جرب البحث بكلمة أخرى أو تغيير تصنيف الماركة أو المدينة."
              actionLabel="عرض كافة الأجهزة"
              onAction={() => {
                setActiveCategory('all');
                setSelectedCity('');
                setSelectedBrand('');
                setSearchQuery('');
              }}
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredDevices.map((device) => (
                <PhoneDeviceCard
                  key={device.id}
                  device={device}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {phoneStores.map((store) => (
              <BusinessCard
                key={store.id}
                business={store}
                onNavigate={(id) => onNavigate(`/business/${id}`)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
