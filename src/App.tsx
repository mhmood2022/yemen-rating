import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { SearchSection } from './components/common/SearchSection';
import { HomeView } from './components/home/HomeView';
import { CategoryListing } from './components/category/CategoryListing';
import { BusinessDetails } from './components/business/BusinessDetails';
import { SAMPLE_BUSINESSES, BusinessItem } from './data/mockData';

export function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessItem | null>(null);
  const [selectedGov, setSelectedGov] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');

  const handleGlobalSearch = (query: string, govId: string, cityId: string) => {
    setSelectedGov(govId);
    setSelectedCity(cityId);
    if (selectedBusiness) setSelectedBusiness(null);
  };

  const handleSelectCategory = (slug: string) => {
    setSelectedCategorySlug(slug);
    setSelectedBusiness(null);
    setIsSidebarOpen(false);
  };

  const handleSelectBusiness = (business: BusinessItem) => {
    setSelectedBusiness(business);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoHome = () => {
    setSelectedCategorySlug(null);
    setSelectedBusiness(null);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans selection:bg-amber-400 selection:text-zinc-950">
      
      {/* 1. Header (Sticky Top) */}
      <Header
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        onNavigateHome={handleGoHome}
      />

      {/* 2. Prominent Search Section (Below Header) */}
      <SearchSection
        onSearch={handleGlobalSearch}
        selectedGov={selectedGov}
        selectedCity={selectedCity}
        onGovChange={setSelectedGov}
        onCityChange={setSelectedCity}
      />

      {/* 3. Main Container: Sidebar + Content */}
      <div className="flex-1 w-full max-w-7xl mx-auto flex">
        
        {/* Public Sidebar (26 Categories) */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          selectedCategorySlug={selectedCategorySlug}
          onSelectCategory={handleSelectCategory}
        />

        {/* Dynamic Main Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {selectedBusiness ? (
            /* View 1: Business Details Page */
            <BusinessDetails
              business={selectedBusiness}
              onBack={() => setSelectedBusiness(null)}
            />
          ) : selectedCategorySlug ? (
            /* View 2: Category Listing Page */
            <CategoryListing
              categorySlug={selectedCategorySlug}
              businesses={SAMPLE_BUSINESSES}
              selectedGov={selectedGov}
              selectedCity={selectedCity}
              onSelectBusiness={handleSelectBusiness}
              onBackHome={handleGoHome}
            />
          ) : (
            /* View 3: Homepage Visitor Journey */
            <HomeView
              onSelectCategory={handleSelectCategory}
              onSelectBusiness={handleSelectBusiness}
              businesses={SAMPLE_BUSINESSES}
            />
          )}
        </main>
      </div>

    </div>
  );
}

export default App;
