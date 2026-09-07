import React, { useState, useEffect } from 'react';
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
import { BanksAndWalletsPage } from './pages/BanksAndWalletsPage';
import { AdBanner } from './components/common/AdBanner';
import { SAMPLE_BUSINESSES, BusinessItem } from './data/mockData';

export function MainPublicApp() {
  // قراءة رابط التصنيف المباشر عند بدء الفتح
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get('category');
      if (cat) {
        handleSelectCategory(cat);
      }
    } catch (e) {
      console.warn('URL parsing error:', e);
    }
  }, []);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessItem | null>(null);
  const [currentPage, setCurrentPage] = useState<'home' | 'auctions' | 'markets' | 'real-estate' | 'jobs' | 'exchange-rates' | 'profile' | 'notifications' | 'favorites' | 'phones' | 'banks'>('home');
  const [selectedGov, setSelectedGov] = useState<string>('كل المحافظات');
  const [selectedCity, setSelectedCity] = useState<string>('all');

  // التمرير التلقائي لأعلى الصفحة فوراً عند فتح أي قسم
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [currentPage, selectedBusiness, selectedCategorySlug]);

  const handleGlobalSearch = (query: string, govId: string, cityId: string) => {
    setSelectedGov(govId);
    setSelectedCity(cityId);
    if (selectedBusiness) setSelectedBusiness(null);
  };

  function handleSelectCategory(slug: string) {
    if (slug === 'all') {
      setIsSidebarOpen(true);
      return;
    }
    // توجيه قسم البنوك والمصارف والمحافظ
    if (slug === 'banks' || slug === 'banks-and-wallets' || slug === 'wallets') {
      setCurrentPage('banks');
      setSelectedCategorySlug(null);
      setSelectedBusiness(null);
      return;
    }
    // توجيه سوق الهواتف
    if (slug === 'phones' || slug === 'cat-phones') {
      setCurrentPage('phones');
      setSelectedCategorySlug(null);
      setSelectedBusiness(null);
      return;
    }
    // توجيه المزادات
    if (slug === 'auctions') {
      setCurrentPage('auctions');
      setSelectedCategorySlug(null);
      setSelectedBusiness(null);
    } else if (slug === 'markets') {
      setCurrentPage('markets');
      setSelectedCategorySlug(null);
      setSelectedBusiness(null);
    } else if (slug === 'real-estate') {
      setCurrentPage('real-estate');
      setSelectedCategorySlug(null);
      setSelectedBusiness(null);
    } else if (slug === 'jobs') {
      setCurrentPage('jobs');
      setSelectedCategorySlug(null);
      setSelectedBusiness(null);
    } else if (slug === 'exchange-rates') {
      setCurrentPage('exchange-rates');
      setSelectedCategorySlug(null);
      setSelectedBusiness(null);
    } else {
      setSelectedCategorySlug(slug);
      setSelectedBusiness(null);
      setCurrentPage('home');
    }
  };

  const handleSelectBusiness = (business: BusinessItem) => {
    setSelectedBusiness(business);
  };

  const handleBackToHome = () => {
    setSelectedBusiness(null);
    setSelectedCategorySlug(null);
    setCurrentPage('home');
  };

  const isAtMainHome = currentPage === 'home' && !selectedBusiness && !selectedCategorySlug;

  return (
    <div dir="rtl" className="min-h-screen bg-[#070A10] text-zinc-100 flex flex-col font-['Cairo',sans-serif]">
      
      {/* 1. الهيدر المثبت الدائم */}
      <header className="sticky top-0 z-50 bg-[#070A10]/98 backdrop-blur-xl border-b border-[#1F2937] shadow-2xl">
        <Header
          onToggleSidebar={() => setIsSidebarOpen(true)}
          onNavigateHome={handleBackToHome}
          onNavigateNotifications={() => setCurrentPage('notifications')}
          unreadNotificationsCount={3}
        />
        
        {/* يظهر الإعلان العلوي #1 فقط في الصفحة الرئيسية */}
        {isAtMainHome && (
          <div className="max-w-6xl mx-auto px-3 py-1 border-t border-[#1F2937]/30">
            <AdBanner placementId="1" className="mb-0" />
          </div>
        )}
      </header>

      {/* 2. القائمة الجانبية */}
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

      {/* 3. جسم المحتوى الرئيسي */}
      <main className="flex-1 pb-16">
        {isAtMainHome && (
          <SearchSection
            onSearch={handleGlobalSearch}
            selectedGov={selectedGov}
            selectedCity={selectedCity}
          />
        )}

        {selectedBusiness ? (
          <BusinessDetails
            business={selectedBusiness}
            onBack={handleBackToHome}
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
        ) : currentPage === 'banks' ? (
          <BanksAndWalletsPage onNavigate={handleBackToHome} />
        ) : currentPage === 'phones' ? (
          <PhoneMarketPage onNavigate={handleBackToHome} />
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
        ) : currentPage === 'profile' ? (
          <ProfilePage onBack={handleBackToHome} />
        ) : currentPage === 'notifications' ? (
          <NotificationsPage onBack={handleBackToHome} />
        ) : currentPage === 'favorites' ? (
          <FavoritesPage onBack={handleBackToHome} />
        ) : null}
      </main>

    </div>
  );
}

export default MainPublicApp;
