import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';

// 1. مكونات وصفحات الموقع العام الأصلي
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { HomePage } from './pages/HomePage';
import { DirectoryPage } from './pages/DirectoryPage';
import { PropertiesPage } from './pages/PropertiesPage';
import { JobsPage } from './pages/JobsPage';
import { PhoneMarketPage } from './pages/PhoneMarketPage';
import { PricesPage } from './pages/PricesPage';
import { BanksAndWalletsPage } from './pages/BanksAndWalletsPage';
import { OffersPage } from './pages/OffersPage';
import { NotificationsPage } from './pages/NotificationsPage';

// 2. مكونات لوحة التحكم (Admin Master & 16 Modules)
import { AdminMaster } from './pages/admin/AdminMaster';
import { AdminDashboardOverview } from './pages/admin/AdminDashboardOverview';
import { CompaniesManager } from './pages/admin/companies/CompaniesManager';
import { AuctionsManager } from './pages/admin/auctions/AuctionsManager';
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

// هيكل الموقع العام الحقيقي للزوار
function PublicSiteLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div dir="rtl" className="min-h-screen bg-[#070A10] text-white flex flex-col font-['Cairo',sans-serif]">
      {/* الهيدر الأصلي للموقع */}
      <Header
        onToggleSidebar={() => setIsSidebarOpen(true)}
        onNavigateHome={() => navigate('/')}
        onNavigateNotifications={() => navigate('/notifications')}
        unreadNotificationsCount={3}
      />

      {/* القائمة الجانبية للموقع العام */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* محتوى الصفحة */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* مسارات الموقع العام الحقيقية للزوار */}
        <Route path="/" element={<PublicSiteLayout><HomePage onSelectBusiness={() => {}} /></PublicSiteLayout>} />
        <Route path="/directory" element={<PublicSiteLayout><DirectoryPage /></PublicSiteLayout>} />
        <Route path="/properties" element={<PublicSiteLayout><PropertiesPage /></PublicSiteLayout>} />
        <Route path="/jobs" element={<PublicSiteLayout><JobsPage /></PublicSiteLayout>} />
        <Route path="/phones" element={<PublicSiteLayout><PhoneMarketPage /></PublicSiteLayout>} />
        <Route path="/prices" element={<PublicSiteLayout><PricesPage /></PublicSiteLayout>} />
        <Route path="/banks" element={<PublicSiteLayout><BanksAndWalletsPage /></PublicSiteLayout>} />
        <Route path="/offers" element={<PublicSiteLayout><OffersPage /></PublicSiteLayout>} />
        <Route path="/notifications" element={<PublicSiteLayout><NotificationsPage /></PublicSiteLayout>} />

        {/* لوحة التحكم المعزولة والسرية — 16 قسماً بكافة الأدوات */}
        <Route path="/admin" element={<AdminMaster />}>
          <Route index element={<AdminDashboardOverview />} />
          <Route path="companies" element={<CompaniesManager />} />
          <Route path="categories" element={<CategoriesManager />} />
          <Route path="claims" element={<ClaimsManager />} />
          <Route path="markets" element={<MarketsManager />} />
          <Route path="auctions" element={<AuctionsManager />} />
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

        {/* أي مسار مجهول يرجع للصفحة الرئيسية */}
        <Route path="*" element={<PublicSiteLayout><HomePage onSelectBusiness={() => {}} /></PublicSiteLayout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
