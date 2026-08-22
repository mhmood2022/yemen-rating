import React, { useState } from 'react';
import { DEMO_BUSINESSES } from '../data/demoBusinesses';
import { HeroBanner } from '../components/home/HeroBanner';
import { CategorySlider } from '../components/home/CategorySlider';
import { HomePricesWidget } from '../components/home/HomePricesWidget';
import { HomeReviewsWidget } from '../components/home/HomeReviewsWidget';
import { BusinessCard } from '../components/business/BusinessCard';
import { Search, MapPin } from 'lucide-react';

export const HomePage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate(`/directory?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      onNavigate('/directory');
    }
  };

  // Exactly matching items from Reference Image 1
  const topRatedItems = [
    DEMO_BUSINESSES.find((b) => b.id === 't3') || DEMO_BUSINESSES[0], // خدمات الخليج
    DEMO_BUSINESSES.find((b) => b.id === 't2') || DEMO_BUSINESSES[1], // هايبر بلس
    DEMO_BUSINESSES.find((b) => b.id === 't4') || DEMO_BUSINESSES[2], // مطعم حضرموت
  ];

  const trendingItems = [
    { business: DEMO_BUSINESSES.find((b) => b.id === 't6') || DEMO_BUSINESSES[0], flame: 76 },  // غسيل حريري
    { business: DEMO_BUSINESSES.find((b) => b.id === 't5') || DEMO_BUSINESSES[1], flame: 98 },  // متجر العصرية
    { business: DEMO_BUSINESSES.find((b) => b.id === 't1') || DEMO_BUSINESSES[2], flame: 125 }, // مطعم البيت اليمني
  ];

  return (
    <div className="space-y-4 pb-6 max-w-lg mx-auto">
      {/* Search Bar & Location */}
      <div className="space-y-2">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن نشاط أو شركة أو خدمة..."
            className="w-full h-[42px] pr-10 pl-4 rounded-[12px] bg-[#111111] text-white placeholder:text-[#71717A] text-xs outline-none border border-[#222222] focus:border-[#F5C400] transition-colors shadow-sm"
          />
          <Search
            size={16}
            strokeWidth={2}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#71717A]"
          />
        </form>

        <div className="flex items-center justify-end gap-1 text-xs text-[#A1A1AA] px-1">
          <span className="font-bold text-white">اليمن، صنعاء</span>
          <MapPin size={13} strokeWidth={2.5} className="text-[#F5C400] shrink-0" />
        </div>
      </div>

      {/* Hero Banner */}
      <HeroBanner onNavigate={onNavigate} />

      {/* Main 5 Categories */}
      <CategorySlider onNavigate={onNavigate} />

      {/* Top Rated (الأعلى تقييماً) */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-sm sm:text-base font-black text-white">
            الأعلى تقييماً
          </h2>
          <button
            type="button"
            onClick={() => onNavigate('/directory')}
            className="text-xs font-black text-[#F5C400] hover:underline transition-colors"
          >
            عرض الكل
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {topRatedItems.map((biz) => (
            <BusinessCard
              key={biz.id}
              business={biz}
              variant="topRated"
              onNavigate={(id) => onNavigate(`/business/${id}`)}
            />
          ))}
        </div>
      </section>

      {/* Trending (الترند الآن) */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-sm sm:text-base font-black text-white">
            الترند الآن
          </h2>
          <button
            type="button"
            onClick={() => onNavigate('/trend')}
            className="text-xs font-black text-[#F5C400] hover:underline transition-colors"
          >
            عرض الكل
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {trendingItems.map(({ business, flame }) => (
            <BusinessCard
              key={business.id}
              business={business}
              variant="trending"
              trendCount={flame}
              onNavigate={(id) => onNavigate(`/business/${id}`)}
            />
          ))}
        </div>
      </section>

      {/* Prices Financial Board */}
      <HomePricesWidget onNavigate={onNavigate} />

      {/* Latest Reviews */}
      <HomeReviewsWidget onNavigate={onNavigate} />
    </div>
  );
};
