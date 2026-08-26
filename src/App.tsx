import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ModalProvider } from './context/ModalContext';
import { ThemeProvider } from './context/ThemeContext';
import { AdminProvider } from './context/AdminContext';
import { ComparisonProvider } from './context/ComparisonContext';

import { HomePage } from './pages/HomePage';
import { BusinessProfilePage } from './pages/BusinessProfilePage';
import { CategoryCollectivePage } from './pages/CategoryCollectivePage';
import { OwnerDashboardPage } from './pages/OwnerDashboardPage';
import { AdminDashboardShell } from './pages/AdminDashboardShell';
import { JobsPage } from './pages/JobsPage';
import { PricesPage } from './pages/PricesPage';

export const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname + window.location.search);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname + window.location.search);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const url = new URL(window.location.origin + currentPath);
  const pathname = url.pathname;

  const categoryMap: Record<string, { slug: string; title: string; icon: string }> = {
    '/restaurants': { slug: 'restaurants', title: 'المطاعم والكافيهات', icon: 'fa-utensils' },
    '/hotels': { slug: 'hotels', title: 'الفنادق والإقامة والسياحة', icon: 'fa-hotel' },
    '/banks': { slug: 'banks', title: 'البنوك والمصارف', icon: 'fa-building-columns' },
    '/exchanges': { slug: 'exchanges', title: 'شركات الصرافة والتحويلات', icon: 'fa-money-bill-transfer' },
    '/wallets': { slug: 'wallets', title: 'المحافظ والخدمات المالية', icon: 'fa-wallet' },
    '/companies': { slug: 'companies', title: 'الشركات والمؤسسات', icon: 'fa-building' },
    '/transport': { slug: 'transport', title: 'السيارات والنقل البري', icon: 'fa-car' },
    '/shops': { slug: 'shops', title: 'المتاجر ومراكز التسوق', icon: 'fa-bag-shopping' },
    '/health': { slug: 'health', title: 'الصحة والمستشفيات', icon: 'fa-hospital' },
    '/services': { slug: 'services', title: 'الخدمات العامة', icon: 'fa-wrench' },
    '/education': { slug: 'education', title: 'التعليم والجامعات', icon: 'fa-graduation-cap' },
    '/entertainment': { slug: 'entertainment', title: 'السياحة والترفيه', icon: 'fa-umbrella-beach' },
    '/discovery': { slug: 'all', title: 'جميع الأنشطة المحلية', icon: 'fa-compass' },
  };

  const renderContent = () => {
    // 1. لوحة تحكم الإدارة المركزية
    if (pathname.startsWith('/admin')) {
      return <AdminDashboardShell onNavigate={navigate} />;
    }

    // 2. لوحة مالك النشاط (تشمل الإعلانات والرسائل)
    if (pathname.startsWith('/owner')) {
      return <OwnerDashboardPage onNavigate={navigate} />;
    }

    // 3. بوابة الوظائف
    if (pathname === '/jobs') {
      return <JobsPage onNavigate={navigate} />;
    }

    // 4. أسعار الصرف
    if (pathname === '/prices') {
      return <PricesPage onNavigate={navigate} />;
    }

    // 5. بروفايل المنشأة المخصص
    if (pathname.startsWith('/businesses/') || pathname.startsWith('/business/')) {
      const slug = pathname.replace('/businesses/', '').replace('/business/', '');
      return <BusinessProfilePage slug={slug} onNavigate={navigate} />;
    }

    // 6. صفحات التصنيفات واستكشاف Local Discovery
    if (categoryMap[pathname]) {
      const cat = categoryMap[pathname];
      return (
        <CategoryCollectivePage
          categorySlug={cat.slug}
          categoryTitle={cat.title}
          categoryIcon={cat.icon}
          onNavigate={navigate}
        />
      );
    }

    // الصفحة الرئيسية الافتراضية
    return <HomePage onNavigate={navigate} />;
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <AdminProvider>
          <ComparisonProvider>
            <ModalProvider>
              {renderContent()}
            </ModalProvider>
          </ComparisonProvider>
        </AdminProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
