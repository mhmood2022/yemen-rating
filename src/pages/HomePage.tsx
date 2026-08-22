import React, { useState } from 'react';
import { DEMO_BUSINESSES } from '../data/demoBusinesses';
import { HeroBanner } from '../components/home/HeroBanner';
import { CategorySlider } from '../components/home/CategorySlider';
import { HomePricesWidget } from '../components/home/HomePricesWidget';
import { HomeReviewsWidget } from '../components/home/HomeReviewsWidget';
import { BusinessCard } from '../components/business/BusinessCard';
import { Search, MapPin, ArrowLeft } from 'lucide-react';

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

  // Top rated items (مطعم حضرموت، هايبر بلس، خدمات الخليج)
  const topRatedItems = [
    DEMO_BUSINESSES.find((b) => b.id === 't4') || DEMO_BUSINESSES[0],
    DEMO_BUSINESSES.find((b) => b.id === 't2') || DEMO_BUSINESSES[1],
    DEMO_BUSINESSES.find((b) => b.id === 't3') || DEMO_BUSINESSES[2],
  ];

  // Trending items with flame counts (مطعم البيت اليمني 125، متجر العصرية 98، غسيل حريري 76)
  const trendingItems = [
    { business: DEMO_BUSINESSES.find((b) => b.id === 't1') || DEMO_BUSINESSES[0], flame: 125 },
    { business: DEMO_BUSINESSES.find((b) => b.id === 't5') || DEMO_BUSINESSES[1], flame: 98 },
    { business: DEMO_BUSINESSES.find((b) => b.id === 't6') || DEMO_BUSINESSES[2], flame: 76 },
  ];

  return (
    <div className="space-y-6 pb-6 max-w-2xl mx-auto">
      {/* 1. Search Bar & Location Header */}
      <div className="space-y-2.5">
        {/* Pill Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن نشاط أو شركة أو خدمة..."
            className="w-full h-[44px] pr-10 pl-4 rounded-[12px] bg-white dark:bg-[#111111] text-[#0B1F3A] dark:text-white placeholder:text-[#94A3B8] dark:placeholder:text-[#71717A] text-xs sm:text-sm outline-none border border-[#E2E8F0] dark:border-[#222222] focus:border-[#F5C400] transition-colors shadow-sm"
          />
          <Search
            size={18}
            strokeWidth={1.75}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] dark:text-[#71717A]"
          />
        </form>

        {/* Location Picker Badge */}
        <div className="flex items-center gap-1.5 text-xs text-[#64748B] dark:text-[#A1A1AA] px-1">
          <MapPin size={14} strokeWidth={2} className="text-[#F5C400] shrink-0" />
          <span className="font-semibold text-[#0B1F3A] dark:text-white">اليمن، صنعاء</span>
        </div>
      </div>

      {/* 2. Hero Banner Slider */}
      <HeroBanner onNavigate={onNavigate} />

      {/* 3. Main Categories Grid (5 Cards) */}
      <CategorySlider onNavigate={onNavigate} />

      {/* 4. Top Rated Section (الأعلى تقييماً) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-sm sm:text-base font-bold text-[#0B1F3A] dark:text-white">
            الأعلى تقييماً
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

        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
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

      {/* 5. Trending Section (الترند الآن) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-sm sm:text-base font-bold text-[#0B1F3A] dark:text-white">
            الترند الآن
          </h2>
          <button
            type="button"
            onClick={() => onNavigate('/trend')}
            className="text-xs font-semibold text-[#64748B] dark:text-[#A1A1AA] hover:text-[#0B1F3A] dark:hover:text-[#F5C400] transition-colors flex items-center gap-1"
          >
            <span>عرض الكل</span>
            <ArrowLeft size={12} strokeWidth={1.75} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
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

      {/* 6. Prices Financial Board Widget */}
      <HomePricesWidget onNavigate={onNavigate} />

      {/* 7. Latest Reviews Widget */}
      <HomeReviewsWidget onNavigate={onNavigate} />
    </div>
  );
};
