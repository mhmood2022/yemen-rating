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
import { PhoneMarketPage } from './pages/PhoneMarketPage';
import { BottomNav } from './components/common/BottomNav';
import { AdBanner } from './components/common/AdBanner';
import { SAMPLE_BUSINESSES, BusinessItem } from './data/mockData';

export function MainPublicApp() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessItem | null>(null);
  const [currentPage, setCurrentPage] = useState<'home' | 'auctions' | 'markets' | 'real-estate' | 'jobs' | 'exchange-rates' | 'profile' | 'notifications' | 'favorites' | 'phones'>('home');
  const [selectedGov, setSelectedGov] = useState<string>('كل المحافظات');
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
    if (slug === 'phones' || slug === 'cat-phones') {
      setCurrentPage('phones');
      setSelectedCategorySlug(null);
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
      setSelectedBusiness(null);
      setCurrentPage('home');
    }
  };

  const handleSelectBusiness = (business: BusinessItem) => {
    setSelectedBusiness(business);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    setSelectedBusiness(null);
    setSelectedCategorySlug(null);
    setCurrentPage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#070A10] text-zinc-100 flex flex-col font-['Cairo',sans-serif]">
      
      {/* الهيدر والإعلان العلوي مثبتان معاً في الأعلى دائماً */}
      <div className="sticky top-0 z-50 bg-[#070A10]/95 backdrop-blur-md border-b border-[#1F2937] shadow-xl">
        <Header
          onToggleSidebar={() => setIsSidebarOpen(true)}
          onNavigateHome={handleBackToHome}
          onNavigateNotifications={() => setCurrentPage('notifications')}
          unreadNotificationsCount={3}
        />
        {/* إعلان البانر العلوي الثابت مع الهيدر */}
        <div className="max-w-6xl mx-auto px-3 py-1">
          <AdBanner placementId="1" className="mb-0" />
        </div>
      </div>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onSelectCategory={handleSelectCategory}
        onNavigateAuctions={() => { setCurrentPage('auctions'); setIsSidebarOpen(false); }}
        onNavigateMarkets={() => { setCurrentPage('markets'); setIsSidebarOpen(false); }}
        onNavigateRealEstate={() => { setCurrentPage('real-estate'); setIsSidebarOpen(false); }}
        onNavigateJobs={() => { setCurrentPage('jobs'); setIsSidebarOpen(false); }}
        onNavigateExchangeRates={() => { setCurrentPage('exchange-rates'); setIsSidebarOpen(false); }}
        onNavigateProfile={() => { setCurrentPage('profile'); setIsSidebarOpen(false); }}
        onNavigateNotifications={() => { setCurrentPage('notifications'); setIsSidebarOpen(false); }}
        onNavigateFavorites={() => { setCurrentPage('favorites'); setIsSidebarOpen(false); }}
      />

      <main className="flex-1">
        {currentPage === 'home' && !selectedBusiness && !selectedCategorySlug && (
          <SearchSection
            onSearch={handleGlobalSearch}
            selectedGov={selectedGov}
            selectedCity={selectedCity}
          />
        )}

        {selectedBusiness ? (
          <BusinessDetails
            business={selectedBusiness}
            onBack={() => setSelectedBusiness(null)}
          />
        ) : selectedCategorySlug ? (
          <CategoryListing
            categorySlug={selectedCategorySlug}
            onBack={handleBackToHome}
            onSelectBusiness={handleSelectBusiness}
            businesses={SAMPLE_BUSINESSES}
            selectedGov={selectedGov}
            selectedCity={selectedCity}
          />
        ) : currentPage === 'home' ? (
          <HomeView
            onSelectCategory={handleSelectCategory}
            onSelectBusiness={handleSelectBusiness}
            businesses={SAMPLE_BUSINESSES}
            onNavigateAuctions={() => setCurrentPage('auctions')}
            onNavigateRealEstate={() => setCurrentPage('real-estate')}
            onNavigateJobs={() => setCurrentPage('jobs')}
            onNavigateExchangeRates={() => setCurrentPage('exchange-rates')}
            onNavigatePhones={() => setCurrentPage('phones')}
          />
        ) : currentPage === 'auctions' ? (
          <AuctionsPage onBack={handleBackToHome} />
        ) : currentPage === 'markets' ? (
          <MarketsPage onBack={handleBackToHome} />
        ) : currentPage === 'real-estate' ? (
          <RealEstatePage onBack={handleBackToHome} />
        ) : currentPage === 'jobs' ? (
          <JobsPage onBack={handleBackToHome} />
        ) : currentPage === 'exchange-rates' ? (
          <ExchangeRatesPage onBack={handleBackToHome} />
        ) : currentPage === 'phones' ? (
          <PhoneMarketPage onNavigate={handleBackToHome} />
        ) : currentPage === 'profile' ? (
          <ProfilePage onBack={handleBackToHome} />
        ) : currentPage === 'notifications' ? (
          <NotificationsPage onBack={handleBackToHome} />
        ) : currentPage === 'favorites' ? (
          <FavoritesPage onBack={handleBackToHome} />
        ) : null}
      </main>

      {/* شريط التنقل السفلي الفاخر */}
      <BottomNav
        activeTab={currentPage}
        onTabChange={(tab) => {
          if (tab === 'more') {
            setIsSidebarOpen(true);
          } else {
            setCurrentPage(tab as any);
            setSelectedCategorySlug(null);
            setSelectedBusiness(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        onAddBusiness={() => { setIsSidebarOpen(true); }}
      />
    </div>
  );
}

export default MainPublicApp;
