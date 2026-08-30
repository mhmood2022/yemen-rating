import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

function PublicHomePage() {
  return (
    <div dir="rtl" className="min-h-screen bg-[#070A10] text-white flex flex-col items-center justify-center p-6 font-['Cairo',sans-serif]">
      <div className="w-16 h-16 rounded-2xl bg-[#FFC500] flex items-center justify-center font-black text-black text-2xl mb-4 shadow-lg shadow-[#FFC500]/20">
        YR
      </div>
      <h1 className="text-3xl font-black text-white mb-2">منصة تقييم اليمن — Yemen Rating</h1>
      <p className="text-[#9CA3AF] text-sm max-w-md text-center leading-relaxed">
        المنصة الوطنية الرائدة لتقييم الأنشطة، المزادات، العقارات، والخدمات الشاملة في الجمهورية اليمنية.
      </p>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicHomePage />} />

        {/* لوحة التحكم الكاملة — الأقسام الـ 16 */}
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

        <Route path="*" element={<PublicHomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
