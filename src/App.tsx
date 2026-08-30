import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// 1. استيراد المنصة الأصلية بالكامل 100%
import { MainPublicApp } from './MainPublicApp';

// 2. استيراد لوحة التحكم (Admin Master & 16 Modules)
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

export function App() {
  const isDashboardPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');

  // إذا كان المستخدم في الموقع العام، يتم عرض تطبيق يمن ريتنغ الأصلي بكامل تفاصيله
  if (!isDashboardPath) {
    return <MainPublicApp />;
  }

  // إذا كان في مسار الإدارة، يتم فتح لوحة التحكم
  return (
    <BrowserRouter>
      <Routes>
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
        <Route path="*" element={<MainPublicApp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
