import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AdminMaster } from './pages/admin/AdminMaster';
import { AdminDashboardOverview } from './pages/admin/AdminDashboardOverview';
import { CompaniesManager } from './pages/admin/companies/CompaniesManager';
import { AuctionsManager } from './pages/admin/auctions/AuctionsManager';
import { AdGeneratorStudio } from './pages/admin/ads/AdGeneratorStudio';
import { RealEstateManager } from './pages/admin/real-estate/RealEstateManager';
import { CategoriesManager } from './pages/admin/categories/CategoriesManager';
import { ClaimsManager } from './pages/admin/claims/ClaimsManager';

// واجهة الموقع العام للزوار
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

        {/* لوحة التحكم الكاملة */}
        <Route path="/admin" element={<AdminMaster />}>
          <Route index element={<AdminDashboardOverview />} />
          <Route path="companies" element={<CompaniesManager />} />
          <Route path="categories" element={<CategoriesManager />} />
          <Route path="claims" element={<ClaimsManager />} />
          <Route path="markets" element={<div className="p-6 text-white font-bold">إدارة الأسواق والأسعار</div>} />
          <Route path="auctions" element={<AuctionsManager />} />
          <Route path="ads" element={<AdGeneratorStudio />} />
          <Route path="ads/generator" element={<AdGeneratorStudio />} />
          <Route path="jobs" element={<div className="p-6 text-white font-bold">الوظائف والتوظيف</div>} />
          <Route path="real-estate" element={<RealEstateManager />} />
          <Route path="phones" element={<div className="p-6 text-white font-bold">سوق الهواتف</div>} />
          <Route path="cleaning" element={<div className="p-6 text-white font-bold">قطاع التنظيف</div>} />
          <Route path="users" element={<div className="p-6 text-white font-bold">المستخدمون والأدوار الـ 11</div>} />
          <Route path="analytics" element={<div className="p-6 text-white font-bold">التقارير والمالية</div>} />
          <Route path="gold-currency" element={<div className="p-6 text-white font-bold">الذهب والعملات والبنوك</div>} />
          <Route path="matching" element={<div className="p-6 text-white font-bold">المطابقة الذكية YR AI</div>} />
          <Route path="settings" element={<div className="p-6 text-white font-bold">السجل والإعدادات Audit Log</div>} />
        </Route>

        <Route path="*" element={<PublicHomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
