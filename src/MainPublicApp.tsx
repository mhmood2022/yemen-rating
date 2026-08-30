import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { SearchSection } from './components/common/SearchSection';
import { HomeView } from './components/home/HomeView';
import { CategoryListing } from './components/category/CategoryListing';
import { BusinessDetails } from './components/business/BusinessDetails';
import { AuctionsPage } from './components/pages/AuctionsPage';
import { MarketsPage } from './components/pages/MarketsPage';
import { RealEstatePage } from './components/pages/RealEstatePage';
import { JobsPage } from './components/pages/JobsPage';
import { ExchangeRatesPage } from './components/pages/ExchangeRatesPage';
import { ProfilePage } from './components/pages/ProfilePage';
import { NotificationsPage } from './components/pages/NotificationsPage';
import { FavoritesPage } from './components/pages/FavoritesPage';
import { SAMPLE_BUSINESSES, BusinessItem } from './data/mockData';

export function MainPublicApp() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessItem | null>(null);
  const [currentPage, setCurrentPage] = useState<'home' | 'auctions' | 'markets' | 'real-estate' | 'jobs' | 'exchange-rates' | 'profile' | 'notifications' | 'favorites'>('home');
  const [selectedGov, setSelectedGov] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');

  const handleGlobalSearch = (query: string, govId: string, cityId: string) => {
    setSelectedGov(govId);
    setSelectedCity(cityId);
    if (selectedBusiness) setSelectedBusiness(null);
  };

  const handleSelectCategory = (slug: string) => {
    if (slug === 'all') {
      setIsSidebarOpen(true);
      return;
    }
    if (slug === 'auctions') {
      setCurrentPage('auctions');
      setSelectedCategorySlug(null);
    } else if (slug === 'markets') {
      setCurrentPage('markets');
      setSelectedCategorySlug(null);
    } else if (slug === 'real-estate') {
      setCurrentPage('real-estate');
      setSelectedCategorySlug(null);
    } else if (slug === 'jobs') {
      setCurrentPage('jobs');
      setSelectedCategorySlug(null);
    } else if (slug === 'exchange-rates') {
      setCurrentPage('exchange-rates');
      setSelectedCategorySlug(null);
    } else {
      setSelectedCategorySlug(slug);
      setCurrentPage('home');
    }
    setSelectedBusiness(null);
    setIsSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectBusiness = (business: BusinessItem) => {
    setSelectedBusiness(business);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoHome = () => {
    setSelectedCategorySlug(null);
    setSelectedBusiness(null);
    setCurrentPage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#0d0d0d] text-white flex flex-col font-sans selection:bg-[#f5c400] selection:text-zinc-950">
      
      {/* 1. Header الأصلي الأنيق */}
      <Header
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        onNavigateHome={handleGoHome}
        onNavigateProfile={() => {
          setCurrentPage('profile');
          setSelectedBusiness(null);
          setSelectedCategorySlug(null);
        }}
        onNavigateNotifications={() => {
          setCurrentPage('notifications');
          setSelectedBusiness(null);
          setSelectedCategorySlug(null);
        }}
      />

      {/* 2. شريط البحث ومحدد المحافظات والمديريات */}
      {currentPage === 'home' && !selectedBusiness && (
        <SearchSection
          onSearch={handleGlobalSearch}
          selectedGov={selectedGov}
          selectedCity={selectedCity}
          onGovChange={setSelectedGov}
          onCityChange={setSelectedCity}
        />
      )}

      {/* 3. الحاوية الرئيسية (القائمة الجانبية + محتوى الصفحات) */}
      <div className="flex-1 w-full max-w-7xl mx-auto flex">
        
        {/* القائمة الجانبية الـ 26 تصنيفاً */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          selectedCategorySlug={selectedCategorySlug || (currentPage !== 'home' ? currentPage : null)}
          onSelectCategory={handleSelectCategory}
        />

        {/* عرض المحتوى التفاعلي */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {selectedBusiness ? (
            <BusinessDetails
              business={selectedBusiness}
              onBack={() => setSelectedBusiness(null)}
            />
          ) : currentPage === 'auctions' ? (
            <AuctionsPage onBack={handleGoHome} />
          ) : currentPage === 'markets' ? (
            <MarketsPage onBack={handleGoHome} />
          ) : currentPage === 'real-estate' ? (
            <RealEstatePage onBack={handleGoHome} />
          ) : currentPage === 'jobs' ? (
            <JobsPage onBack={handleGoHome} />
          ) : currentPage === 'exchange-rates' ? (
            <ExchangeRatesPage onBack={handleGoHome} />
          ) : currentPage === 'profile' ? (
            <ProfilePage onBack={handleGoHome} onNavigateFavorites={() => setCurrentPage('favorites')} />
          ) : currentPage === 'notifications' ? (
            <NotificationsPage onBack={handleGoHome} />
          ) : currentPage === 'favorites' ? (
            <FavoritesPage onBack={handleGoHome} onSelectBusiness={handleSelectBusiness} />
          ) : selectedCategorySlug ? (
            <CategoryListing
              categorySlug={selectedCategorySlug}
              businesses={SAMPLE_BUSINESSES}
              selectedGov={selectedGov}
              selectedCity={selectedCity}
              onSelectBusiness={handleSelectBusiness}
              onBackHome={handleGoHome}
            />
          ) : (
            <HomeView
              onSelectCategory={handleSelectCategory}
              onSelectBusiness={handleSelectBusiness}
              businesses={SAMPLE_BUSINESSES}
              onNavigateAuctions={() => setCurrentPage('auctions')}
              onNavigateRealEstate={() => setCurrentPage('real-estate')}
              onNavigateJobs={() => setCurrentPage('jobs')}
              onNavigateExchangeRates={() => setCurrentPage('exchange-rates')}
            />
          )}
        </main>
      </div>

    </div>
  );
}

export default MainPublicApp;
