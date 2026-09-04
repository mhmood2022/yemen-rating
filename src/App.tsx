import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';

// الهيكل الموحد App Shell
import { AppShell } from './components/layout/AppShell';

// الصفحات الرئيسية والأدلة
import { HomeView } from './components/home/HomeView';
import { BanksPage } from './pages/public/banks/BanksPage';
import { BusinessesPage } from './pages/public/businesses/BusinessesPage';
import { PhoneMarketPage } from './pages/PhoneMarketPage';
import { AuctionsPage } from './components/pages/AuctionsPage';
import { RealEstatePage } from './components/pages/RealEstatePage';
import { JobsPage } from './components/pages/JobsPage';
import { ExchangeRatesPage } from './components/pages/ExchangeRatesPage';
import { SAMPLE_BUSINESSES } from './data/mockData';

// القوالب الديناميكية الموحدة Master Templates
import { BankProfilePage } from './pages/templates/BankProfilePage';
import { BusinessProfilePage } from './pages/templates/BusinessProfilePage';
import { JobDetailsPage } from './pages/templates/JobDetailsPage';
import { PropertyDetailsPage } from './pages/templates/PropertyDetailsPage';
import { AuctionDetailsPage } from './pages/templates/AuctionDetailsPage';

// لوحة تحكم مالك المنشأة المعتمد
import { OwnerDashboardPage } from './pages/owner/OwnerDashboardPage';

// لوحة التحكم الإدارية
import { AdminMaster } from './pages/admin/AdminMaster';
import { AdminDashboardOverview } from './pages/admin/AdminDashboardOverview';
import { CompaniesManager } from './pages/admin/companies/CompaniesManager';
import { AuctionsManager } from './pages/admin/auctions/AuctionsManager';
import { AuctionLiveMonitor } from './pages/admin/auctions/AuctionLiveMonitor';
import { AdsManager } from './pages/admin/ads/AdsManager';
import { AdGeneratorStudio } from './pages/admin/ads/AdGeneratorStudio';
import { RealEstateManager } from './pages/admin/real-estate/RealEstateManager';
import { CategoriesManager } from './pages/admin/categories/CategoriesManager';
import { ClaimsManager } from './pages/admin/claims/ClaimsManager';
import { UsersRolesManager } from './pages/admin/users/UsersRolesManager';
import { GoldCurrencyManager } from './pages/admin/gold-currency/GoldCurrencyManager';
import { JobsManager } from './pages/admin/jobs/JobsManager';
import { MatchingAIManager } from './pages/admin/matching/MatchingAIManager';
import { SettingsAuditManager } from './pages/admin/settings/SettingsAuditManager';
import { MarketsManager } from './pages/admin/markets/MarketsManager';
import { PhonesManager } from './pages/admin/phones/PhonesManager';
import { CleaningManager } from './pages/admin/cleaning/CleaningManager';
import { AnalyticsFinanceManager } from './pages/admin/analytics/AnalyticsFinanceManager';


const HomeRoute: React.FC = () => {
  const navigate = useNavigate();
  return (
    <AppShell>
      <HomeView
        businesses={SAMPLE_BUSINESSES}
        onSelectCategory={(slug) => navigate('/directory?category=' + encodeURIComponent(slug))}
        onSelectBusiness={(biz) => navigate('/businesses/' + (biz.id || biz.slug))}
        onNavigateAuctions={() => navigate('/auctions')}
        onNavigateRealEstate={() => navigate('/properties')}
        onNavigateJobs={() => navigate('/jobs')}
        onNavigateExchangeRates={() => navigate('/exchange-rates')}
        onNavigatePhones={() => navigate('/phones')}
      />
    </AppShell>
  );
};

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* المسارات العامة الموحدة داخل الـ App Shell */}
        <Route path="/" element={<HomeRoute />} />
        <Route path="/prices" element={<AppShell><ExchangeRatesPage onBack={() => window.history.back()} /></AppShell>} />
        
        {/* مسارات البنوك (دليل + قالب ديناميكي) */}
        <Route path="/banks" element={<AppShell><BanksPage /></AppShell>} />
        <Route path="/banks/:slug" element={<AppShell><BankProfilePage /></AppShell>} />

        {/* مسارات المنشآت والشركات (دليل + قالب ديناميكي موحد) */}
        <Route path="/businesses" element={<AppShell><BusinessesPage /></AppShell>} />
        <Route path="/businesses/:slug" element={<AppShell><BusinessProfilePage /></AppShell>} />

        {/* مسارات الوظائف (دليل + قالب ديناميكي) */}
        <Route path="/jobs" element={<AppShell><JobsPage onBack={() => window.history.back()} /></AppShell>} />
        <Route path="/jobs/:slug" element={<AppShell><JobDetailsPage /></AppShell>} />

        {/* مسارات العقارات (دليل + قالب ديناميكي) */}
        <Route path="/properties" element={<AppShell><RealEstatePage onBack={() => window.history.back()} /></AppShell>} />
        <Route path="/properties/:slug" element={<AppShell><PropertyDetailsPage /></AppShell>} />

        {/* مسارات المزادات (دليل + قالب ديناميكي) */}
        <Route path="/auctions" element={<AppShell><AuctionsPage onBack={() => window.history.back()} /></AppShell>} />
        <Route path="/auctions/:slug" element={<AppShell><AuctionDetailsPage /></AppShell>} />

        {/* مسارات سوق الهواتف وأسعار الصرف */}
        <Route path="/phones" element={<AppShell><PhoneMarketPage onNavigate={() => window.history.back()} /></AppShell>} />
        <Route path="/exchange-rates" element={<AppShell><ExchangeRatesPage onBack={() => window.history.back()} /></AppShell>} />

        {/* لوحة تحكم مالك المنشأة */}
        <Route path="/owner" element={<AppShell><OwnerDashboardPage /></AppShell>} />

                                                                    {/* لوحة التحكم الإدارية */}
                                                                    <Route path="/admin" element={<AdminMaster />}>
                                                                        <Route index element={<AdminDashboardOverview />} />
                                                                        <Route path="claims" element={<ClaimsManager />} />
                                                                        <Route path="companies" element={<CompaniesManager />} />
                                                                        <Route path="categories" element={<CategoriesManager />} />
                                                                        <Route path="auctions" element={<AuctionsManager />} />
                                                                        <Route path="ads" element={<AdsManager />} />
                                                                        <Route path="jobs" element={<JobsManager />} />
                                                                        <Route path="real-estate" element={<RealEstateManager />} />
                                                                        <Route path="phones" element={<PhonesManager />} />
                                                                        <Route path="cleaning" element={<CleaningManager />} />
                                                                        <Route path="users" element={<UsersRolesManager />} />
                                                                        <Route path="analytics" element={<AnalyticsFinanceManager />} />
                                                                        <Route path="gold-currency" element={<GoldCurrencyManager />} />
                                                                        <Route path="matching" element={<MatchingAIManager />} />
                                                                        <Route path="settings" element={<SettingsAuditManager />} />
                                                                    </Route>

        {/* لوحة التحكم المعزولة والمحمية /admin */}
        <Route path="/admin" element={<AdminMaster />}>
          <Route index element={<AdminDashboardOverview />} />
          <Route path="companies" element={<CompaniesManager />} />
          <Route path="categories" element={<CategoriesManager />} />
          <Route path="claims" element={<ClaimsManager />} />
          <Route path="markets" element={<MarketsManager />} />
          <Route path="auctions" element={<AuctionsManager />} />
          <Route path="auctions/:id" element={<AuctionLiveMonitor />} />
          <Route path="ads" element={<AdsManager />} />
          <Route path="ads/generator" element={<AdGeneratorStudio />} />
          <Route path="jobs" element={<JobsManager />} />
          <Route path="real-estate" element={<RealEstateManager />} />
          <Route path="phones" element={<PhonesManager />} />
          <Route path="cleaning" element={<CleaningManager />} />
          <Route path="users" element={<UsersRolesManager />} />
          <Route path="analytics" element={<AnalyticsFinanceManager />} />
          <Route path="gold-currency" element={<GoldCurrencyManager />} />
          <Route path="matching" element={<MatchingAIManager />} />
          <Route path="settings" element={<SettingsAuditManager />} />
        </Route>

        {/* إعادة التوجيه للرئيسية */}
        <Route path="*" element={<HomeRoute />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
